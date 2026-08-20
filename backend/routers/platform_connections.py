import os
import secrets
import base64
import hashlib
os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")
from datetime import datetime, timedelta, timezone
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from database import supabase_admin
from auth_utils import get_current_user

router = APIRouter(prefix="/platform-connections", tags=["platform-connections"])

# ---------- YouTube config ----------
YOUTUBE_CLIENT_ID = os.environ["YOUTUBE_CLIENT_ID"]
YOUTUBE_CLIENT_SECRET = os.environ["YOUTUBE_CLIENT_SECRET"]
YOUTUBE_REDIRECT_URI = os.environ["YOUTUBE_REDIRECT_URI"]

YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.profile",
]

# ---------- Instagram config ----------
INSTAGRAM_APP_ID = os.environ["INSTAGRAM_APP_ID"]
INSTAGRAM_APP_SECRET = os.environ["INSTAGRAM_APP_SECRET"]
INSTAGRAM_REDIRECT_URI = os.environ["INSTAGRAM_REDIRECT_URI"]
INSTAGRAM_SCOPES = "instagram_business_basic,instagram_business_manage_messages,instagram_business_content_publish"

# In-memory store mapping a random state -> {code_verifier?, user_id} for
# the brief window between /connect/{platform} and /callback/{platform}.
# PKCE (YouTube only) requires the same code_verifier used to build the
# authorization URL to also be used when exchanging the code for tokens —
# but each request creates a fresh Flow object, so it must be persisted
# manually. `state` is a random, unguessable token (not the user_id) for
# CSRF safety, for both platforms.
# NOTE: in-memory only — fine for local dev, won't survive multiple
# worker processes or restarts. Swap for Redis or a short-TTL DB table
# before deploying for real.
_pkce_store: dict[str, dict] = {}


def _build_youtube_flow() -> Flow:
    """Builds the Google OAuth flow config for YouTube."""
    client_config = {
        "web": {
            "client_id": YOUTUBE_CLIENT_ID,
            "client_secret": YOUTUBE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [YOUTUBE_REDIRECT_URI],
        }
    }
    return Flow.from_client_config(
        client_config, scopes=YOUTUBE_SCOPES, redirect_uri=YOUTUBE_REDIRECT_URI
    )


def _verify_token_query_param(token: str):
    """
    Manually verifies a Supabase access token passed as a query param.
    Needed because /connect/{platform} is hit via a full-page browser
    redirect, which can't attach an Authorization header — so we can't
    use Depends(get_current_user) here.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Missing token.")
    try:
        result = supabase_admin.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    if not result or not result.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return result.user


@router.get("")
def list_connections(user=Depends(get_current_user)):
    result = (
        supabase_admin.table("platform_connections")
        .select("id, platform")
        .eq("user_id", user.id)
        .execute()
    )
    return result.data


# ==================== YOUTUBE ====================

@router.get("/connect/youtube")
def connect_youtube(token: str):
    """
    Starts the YouTube OAuth flow. Triggered by a full-page browser
    redirect, so auth is passed as a query param (?token=...) instead
    of a header, and verified manually. A random, unguessable `state`
    is generated for CSRF protection — the code_verifier and user_id
    are stored together, keyed by that state, for the callback to use.
    """
    user = _verify_token_query_param(token)

    flow = _build_youtube_flow()
    random_state = secrets.token_urlsafe(32)
    auth_url, _ = flow.authorization_url(
        access_type="offline",       # needed to get a refresh_token
        include_granted_scopes="true",
        prompt="consent",            # forces refresh_token on repeat connects
        state=random_state,
    )

    _pkce_store[random_state] = {
        "code_verifier": flow.code_verifier,
        "user_id": user.id,
    }

    return RedirectResponse(auth_url)


@router.get("/callback/youtube")
def youtube_callback(code: str, state: str):
    """
    Google redirects here after the user approves access.
    `state` is the random token generated in /connect/youtube — used
    to look up the matching code_verifier and user_id.
    Exchanges the code for tokens and stores the connection.
    """
    entry = _pkce_store.pop(state, None)
    if not entry:
        raise HTTPException(
            status_code=400,
            detail="OAuth session expired or invalid — please try connecting again.",
        )

    user_id = entry["user_id"]
    code_verifier = entry["code_verifier"]

    flow = _build_youtube_flow()
    flow.code_verifier = code_verifier

    try:
        flow.fetch_token(code=code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth exchange failed: {e}")

    credentials = flow.credentials

    import googleapiclient.discovery

    youtube = googleapiclient.discovery.build(
        "youtube", "v3", credentials=credentials
    )
    channels_response = youtube.channels().list(part="snippet", mine=True).execute()
    channel = channels_response["items"][0] if channels_response.get("items") else {}
    channel_title = channel.get("snippet", {}).get("title", "Unknown Channel")
    channel_id = channel.get("id")

    supabase_admin.table("platform_connections").upsert(
        {
            "user_id": user_id,
            "platform": "youtube",
            "platform_user_id": channel_id,
            "platform_username": channel_title,
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_expires_at": credentials.expiry.isoformat() if credentials.expiry else None,
            "is_active": True,
        },
        on_conflict="user_id,platform",
    ).execute()

    return {"message": f"YouTube channel '{channel_title}' connected successfully."}


# ==================== INSTAGRAM ====================

@router.get("/connect/instagram")
def connect_instagram(token: str):
    """
    Starts the Instagram OAuth flow. Triggered by a full-page browser
    redirect, so auth is passed as a query param (?token=...) and
    verified manually, same pattern as YouTube.
    """
    user = _verify_token_query_param(token)

    random_state = secrets.token_urlsafe(32)
    _pkce_store[random_state] = {"user_id": user.id}

    auth_url = (
        "https://www.instagram.com/oauth/authorize"
        f"?client_id={INSTAGRAM_APP_ID}"
        f"&redirect_uri={INSTAGRAM_REDIRECT_URI}"
        f"&scope={INSTAGRAM_SCOPES}"
        f"&response_type=code"
        f"&state={random_state}"
    )
    return RedirectResponse(auth_url)


@router.get("/callback/instagram")
def instagram_callback(code: str, state: str):
    """
    Instagram redirects here after the user approves access.
    Exchanges the code for a short-lived token, then upgrades it to a
    long-lived token (60 days), and stores the connection.
    """
    entry = _pkce_store.pop(state, None)
    if not entry:
        raise HTTPException(
            status_code=400,
            detail="OAuth session expired or invalid — please try connecting again.",
        )
    user_id = entry["user_id"]

    # Step 1: exchange code for a short-lived access token
    token_response = httpx.post(
        "https://api.instagram.com/oauth/access_token",
        data={
            "client_id": INSTAGRAM_APP_ID,
            "client_secret": INSTAGRAM_APP_SECRET,
            "grant_type": "authorization_code",
            "redirect_uri": INSTAGRAM_REDIRECT_URI,
            "code": code,
        },
    )
    if token_response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"Instagram token exchange failed: {token_response.text}",
        )
    short_lived_data = token_response.json()
    short_lived_token = short_lived_data["access_token"]
    ig_user_id = short_lived_data["user_id"]

    # Step 2: exchange short-lived token for a long-lived one (60 days)
    long_lived_response = httpx.get(
        "https://graph.instagram.com/access_token",
        params={
            "grant_type": "ig_exchange_token",
            "client_secret": INSTAGRAM_APP_SECRET,
            "access_token": short_lived_token,
        },
    )
    if long_lived_response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"Instagram long-lived token exchange failed: {long_lived_response.text}",
        )
    long_lived_data = long_lived_response.json()
    long_lived_token = long_lived_data["access_token"]
    expires_in_seconds = long_lived_data.get("expires_in", 5184000)  # ~60 days default

    # Step 3: fetch the connected Instagram account's username
    profile_response = httpx.get(
        f"https://graph.instagram.com/{ig_user_id}",
        params={"fields": "username", "access_token": long_lived_token},
    )
    username = "Unknown Account"
    if profile_response.status_code == 200:
        username = profile_response.json().get("username", "Unknown Account")

    expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in_seconds)

    supabase_admin.table("platform_connections").upsert(
        {
            "user_id": user_id,
            "platform": "instagram",
            "platform_user_id": ig_user_id,
            "platform_username": username,
            "access_token": long_lived_token,
            "refresh_token": None,  # Instagram uses token refresh, not a separate refresh_token
            "token_expires_at": expires_at.isoformat(),
            "is_active": True,
        },
        on_conflict="user_id,platform",
    ).execute()

    return {"message": f"Instagram account '@{username}' connected successfully."}

TWITTER_CLIENT_ID = os.environ["TWITTER_CLIENT_ID"]
TWITTER_CLIENT_SECRET = os.environ["TWITTER_CLIENT_SECRET"]
TWITTER_REDIRECT_URI = os.environ["TWITTER_REDIRECT_URI"]
TWITTER_SCOPES = "tweet.read tweet.write users.read offline.access"


def _generate_pkce_pair():
    """Generates a PKCE code_verifier and its code_challenge (S256)."""
    code_verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(code_verifier.encode("utf-8")).digest()
    code_challenge = base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")
    return code_verifier, code_challenge


@router.get("/connect/twitter")
def connect_twitter(token: str):
    """
    Starts the Twitter/X OAuth 2.0 flow (PKCE required). Auth passed as
    a query param since this is a full-page redirect, same pattern as
    YouTube/Instagram.
    """
    user = _verify_token_query_param(token)

    code_verifier, code_challenge = _generate_pkce_pair()
    random_state = secrets.token_urlsafe(32)

    _pkce_store[random_state] = {
        "user_id": user.id,
        "code_verifier": code_verifier,
    }

    auth_url = (
        "https://twitter.com/i/oauth2/authorize"
        f"?response_type=code"
        f"&client_id={TWITTER_CLIENT_ID}"
        f"&redirect_uri={TWITTER_REDIRECT_URI}"
        f"&scope={TWITTER_SCOPES.replace(' ', '%20')}"
        f"&state={random_state}"
        f"&code_challenge={code_challenge}"
        f"&code_challenge_method=S256"
    )
    return RedirectResponse(auth_url)


@router.get("/callback/twitter")
def twitter_callback(code: str, state: str):
    """
    Twitter redirects here after the user approves access. Exchanges
    the code for tokens using PKCE, fetches the connected account's
    username, and stores the connection.
    """
    entry = _pkce_store.pop(state, None)
    if not entry:
        raise HTTPException(
            status_code=400,
            detail="OAuth session expired or invalid — please try connecting again.",
        )
    user_id = entry["user_id"]
    code_verifier = entry["code_verifier"]

    # Twitter requires Basic Auth (client_id:client_secret) for confidential clients
    basic_auth = base64.b64encode(
        f"{TWITTER_CLIENT_ID}:{TWITTER_CLIENT_SECRET}".encode("utf-8")
    ).decode("utf-8")

    token_response = httpx.post(
        "https://api.twitter.com/2/oauth2/token",
        headers={
            "Authorization": f"Basic {basic_auth}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": TWITTER_REDIRECT_URI,
            "code_verifier": code_verifier,
        },
    )
    if token_response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"Twitter token exchange failed: {token_response.text}",
        )
    token_data = token_response.json()
    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token")
    expires_in_seconds = token_data.get("expires_in", 7200)

    # Fetch the connected account's username
    profile_response = httpx.get(
        "https://api.twitter.com/2/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    username = "Unknown Account"
    twitter_user_id = None
    if profile_response.status_code == 200:
        profile_data = profile_response.json().get("data", {})
        username = profile_data.get("username", "Unknown Account")
        twitter_user_id = profile_data.get("id")

    expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in_seconds)

    supabase_admin.table("platform_connections").upsert(
        {
            "user_id": user_id,
            "platform": "twitter",
            "platform_user_id": twitter_user_id,
            "platform_username": username,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_expires_at": expires_at.isoformat(),
            "is_active": True,
        },
        on_conflict="user_id,platform",
    ).execute()

    return {"message": f"Twitter account '@{username}' connected successfully."}
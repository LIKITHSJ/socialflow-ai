import os
import secrets
os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from database import supabase_admin
from auth_utils import get_current_user

router = APIRouter(prefix="/platform-connections", tags=["platform-connections"])

YOUTUBE_CLIENT_ID = os.environ["YOUTUBE_CLIENT_ID"]
YOUTUBE_CLIENT_SECRET = os.environ["YOUTUBE_CLIENT_SECRET"]
YOUTUBE_REDIRECT_URI = os.environ["YOUTUBE_REDIRECT_URI"]

YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.profile",
]

# In-memory store mapping a random state -> {code_verifier, user_id} for
# the brief window between /connect/youtube and /callback/youtube.
# PKCE requires the same code_verifier used to build the authorization
# URL to also be used when exchanging the code for tokens — but each
# request creates a fresh Flow object, so it must be persisted manually.
# `state` is a random, unguessable token (not the user_id) for CSRF safety.
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
    Needed because /connect/youtube is hit via a full-page browser
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
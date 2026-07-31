import os
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
def connect_youtube(user=Depends(get_current_user)):
    """
    Starts the YouTube OAuth flow. Redirects the browser to Google's
    consent screen. The user's id is passed through `state` so the
    callback knows who's connecting (state is echoed back by Google).
    """
    flow = _build_youtube_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",       # needed to get a refresh_token
        include_granted_scopes="true",
        prompt="consent",            # forces refresh_token on repeat connects
        state=user.id,
    )
    return RedirectResponse(auth_url)


@router.get("/callback/youtube")
def youtube_callback(code: str, state: str):
    """
    Google redirects here after the user approves access.
    `state` carries back the user_id we passed in `/connect/youtube`.
    Exchanges the code for tokens and stores the connection.
    """
    user_id = state

    flow = _build_youtube_flow()
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
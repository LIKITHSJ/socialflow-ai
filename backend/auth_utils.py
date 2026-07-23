"""
auth_utils.py — Shared auth dependency for SocialFlow AI.
Verifies the Supabase access token sent in the Authorization header
and returns the authenticated user, so routes can just do:
    user = Depends(get_current_user)
"""
from fastapi import Header, HTTPException, status
from database import supabase


async def get_current_user(authorization: str = Header(...)):
    """
    Expects header: Authorization: Bearer <access_token>
    Returns the Supabase user object if valid, else raises 401.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'.",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    if not response or not response.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    return response.user
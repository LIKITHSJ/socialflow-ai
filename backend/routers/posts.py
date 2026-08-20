import os
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import supabase_admin
from auth_utils import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])


class SchedulePostRequest(BaseModel):
    platform: str  # "youtube" | "instagram" | "twitter"
    platform_connection_id: str
    content: str
    media_urls: Optional[list[str]] = None
    scheduled_time: str  # ISO 8601 datetime string
    ai_generated: bool = False


@router.post("/schedule")
def schedule_post(payload: SchedulePostRequest, user=Depends(get_current_user)):
    # Verify the platform_connection belongs to this user
    conn = (
        supabase_admin.table("platform_connections")
        .select("id, platform")
        .eq("id", payload.platform_connection_id)
        .eq("user_id", user.id)
        .execute()
    )
    if not conn.data:
        raise HTTPException(status_code=404, detail="Platform connection not found.")

    result = (
        supabase_admin.table("scheduled_posts")
        .insert(
            {
                "user_id": user.id,
                "platform": payload.platform,
                "platform_connection_id": payload.platform_connection_id,
                "content": payload.content,
                "media_urls": payload.media_urls,
                "scheduled_time": payload.scheduled_time,
                "status": "pending",
                "ai_generated": payload.ai_generated,
            }
        )
        .execute()
    )
    return result.data[0]


@router.get("")
def list_posts(user=Depends(get_current_user)):
    result = (
        supabase_admin.table("scheduled_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_time", desc=False)
        .execute()
    )
    return result.data


@router.delete("/{post_id}")
def cancel_post(post_id: str, user=Depends(get_current_user)):
    result = (
        supabase_admin.table("scheduled_posts")
        .update({"status": "cancelled"})
        .eq("id", post_id)
        .eq("user_id", user.id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found.")
    return {"message": "Post cancelled."}
"""
scheduler_service.py — Background job that publishes scheduled posts
when their scheduled_time arrives. Runs as an asyncio loop inside the
FastAPI app (started on startup), checking every 60 seconds.

NOTE: This is a simple in-process scheduler — fine for a single-worker
dev/demo deployment. It won't scale correctly across multiple worker
processes (each would independently try to publish the same posts).
For production, replace with a proper job queue (Celery, APScheduler
with a DB-backed lock, or a cron-triggered endpoint).
"""
import asyncio
import logging
from datetime import datetime, timezone

import httpx
from database import supabase_admin

logger = logging.getLogger("scheduler")

CHECK_INTERVAL_SECONDS = 60


async def _publish_youtube(connection: dict, post: dict) -> None:
    """
    Publishing a YouTube video requires an actual video file upload,
    which is out of scope for text-based scheduling. For now, this
    marks the post as published without a real API call — replace
    with real video upload logic when that feature is prioritized.
    """
    logger.info(f"[MOCK] Would publish to YouTube: {post['content'][:50]}")


async def _publish_instagram(connection: dict, post: dict) -> None:
    """
    Publishing to Instagram requires media (image/video) via the
    Content Publishing API — a two-step create-container-then-publish
    flow. Mocked for now since media upload/hosting isn't wired up yet.
    """
    logger.info(f"[MOCK] Would publish to Instagram: {post['content'][:50]}")


async def _publish_twitter(connection: dict, post: dict) -> None:
    """
    Publishes a text tweet via Twitter API v2. This one is real —
    Twitter's text-post endpoint doesn't require media.
    """
    access_token = connection["access_token"]
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.twitter.com/2/tweets",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={"text": post["content"]},
        )
    if response.status_code not in (200, 201):
        raise RuntimeError(f"Twitter publish failed: {response.text}")


PUBLISHERS = {
    "youtube": _publish_youtube,
    "instagram": _publish_instagram,
    "twitter": _publish_twitter,
}


async def _process_due_posts():
    """Finds posts whose scheduled_time has passed and publishes them."""
    now = datetime.now(timezone.utc).isoformat()

    due_posts = (
        supabase_admin.table("scheduled_posts")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_time", now)
        .execute()
    )

    for post in due_posts.data:
        conn_result = (
            supabase_admin.table("platform_connections")
            .select("*")
            .eq("id", post["platform_connection_id"])
            .execute()
        )
        if not conn_result.data:
            supabase_admin.table("scheduled_posts").update(
                {"status": "failed", "error_message": "Platform connection not found."}
            ).eq("id", post["id"]).execute()
            continue

        connection = conn_result.data[0]
        publisher = PUBLISHERS.get(post["platform"])

        try:
            if publisher:
                await publisher(connection, post)
            supabase_admin.table("scheduled_posts").update(
                {
                    "status": "published",
                    "published_at": datetime.now(timezone.utc).isoformat(),
                }
            ).eq("id", post["id"]).execute()
            logger.info(f"Published post {post['id']} to {post['platform']}")
        except Exception as e:
            supabase_admin.table("scheduled_posts").update(
                {"status": "failed", "error_message": str(e)}
            ).eq("id", post["id"]).execute()
            logger.error(f"Failed to publish post {post['id']}: {e}")


async def run_scheduler_loop():
    """Runs forever, checking for due posts every CHECK_INTERVAL_SECONDS."""
    while True:
        try:
            await _process_due_posts()
        except Exception as e:
            logger.error(f"Scheduler loop error: {e}")
        await asyncio.sleep(CHECK_INTERVAL_SECONDS)
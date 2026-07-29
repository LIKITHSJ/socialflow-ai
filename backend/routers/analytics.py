from fastapi import APIRouter, HTTPException, Depends, Query
from uuid import UUID
from schemas.analytics import AnalyticsSnapshotOut, AnalyticsSnapshotIn
from database import supabase_admin
from auth_utils import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _verify_ownership(platform_connection_id: UUID, user_id: str):
    result = (
        supabase_admin.table("platform_connections")
        .select("id")
        .eq("id", str(platform_connection_id))
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Platform connection not found for this user.")


@router.get("/{platform_connection_id}", response_model=list[AnalyticsSnapshotOut])
def get_snapshots(
    platform_connection_id: UUID,
    days: int = Query(default=7, ge=1, le=90),
    user=Depends(get_current_user),
):
    _verify_ownership(platform_connection_id, user.id)

    result = (
        supabase_admin.table("analytics_snapshots")
        .select("*")
        .eq("platform_connection_id", str(platform_connection_id))
        .order("snapshot_date", desc=True)
        .limit(days)
        .execute()
    )

    # Return oldest → newest, matching mockAnalytics.ts's chronological ordering
    return list(reversed(result.data))


@router.post("", response_model=AnalyticsSnapshotOut, status_code=201)
def create_snapshot(payload: AnalyticsSnapshotIn, user=Depends(get_current_user)):
    """
    Manually record a snapshot for a connection. In production this would
    typically be written by a scheduled job pulling live platform stats,
    not called directly from the frontend — but useful for seeding test data now.
    """
    _verify_ownership(payload.platform_connection_id, user.id)

    row = {
        "platform_connection_id": str(payload.platform_connection_id),
        "snapshot_date": payload.snapshot_date.isoformat(),
        "metrics": payload.metrics.model_dump(),
    }

    result = supabase_admin.table("analytics_snapshots").insert(row).execute()
    return result.data[0]
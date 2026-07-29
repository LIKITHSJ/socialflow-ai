from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime


class SnapshotMetrics(BaseModel):
    followers: int
    engagement_rate: float
    posts_count: int
    scheduled_count: int


class AnalyticsSnapshotOut(BaseModel):
    platform_connection_id: UUID
    snapshot_date: date
    metrics: SnapshotMetrics


class AnalyticsSnapshotIn(BaseModel):
    platform_connection_id: UUID
    snapshot_date: date
    metrics: SnapshotMetrics
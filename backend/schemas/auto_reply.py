from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class CustomRule(BaseModel):
    keyword: str
    response: str
    enabled: bool = True


class AutoReplyConfigUpdate(BaseModel):
    enabled: bool | None = None
    reply_to_comments: bool | None = None
    reply_to_dms: bool | None = None
    ai_powered: bool | None = None
    ai_prompt: str | None = None
    custom_rules: list[CustomRule] | None = None


class AutoReplyConfigOut(BaseModel):
    id: UUID
    platform_connection_id: UUID
    enabled: bool
    reply_to_comments: bool
    reply_to_dms: bool
    ai_powered: bool
    ai_prompt: str | None
    custom_rules: list[CustomRule]
    created_at: datetime
    updated_at: datetime


class MatchRequest(BaseModel):
    platform_connection_id: UUID
    incoming_text: str
    is_dm: bool = True  # False = comment


class MatchResponse(BaseModel):
    matched: bool
    reply_text: str | None
    source: str | None  # "custom_rule" | "ai" | None
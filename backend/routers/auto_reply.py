from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
from schemas.auto_reply import (
    AutoReplyConfigOut, AutoReplyConfigUpdate, MatchRequest, MatchResponse, CustomRule
)
from database import supabase, supabase_admin
from auth_utils import get_current_user
from services.gemini_service import generate_suggestions  # reused for AI-powered replies

router = APIRouter(prefix="/auto-reply", tags=["auto-reply"])


def _verify_ownership(platform_connection_id: UUID, user_id: str):
    """Ensure the platform_connection belongs to the requesting user before touching its config."""
    result = (
        supabase_admin.table("platform_connections")
        .select("id")
        .eq("id", str(platform_connection_id))
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Platform connection not found for this user.")


@router.get("/{platform_connection_id}", response_model=AutoReplyConfigOut)
def get_config(platform_connection_id: UUID, user=Depends(get_current_user)):
    _verify_ownership(platform_connection_id, user.id)

    result = (
        supabase_admin.table("auto_reply_configs")
        .select("*")
        .eq("platform_connection_id", str(platform_connection_id))
        .execute()
    )

    if result.data:
        return result.data[0]

    # No config yet for this connection — create a default row
    default_row = {
        "platform_connection_id": str(platform_connection_id),
        "enabled": False,
        "reply_to_comments": False,
        "reply_to_dms": False,
        "ai_powered": False,
        "ai_prompt": None,
        "custom_rules": [],
    }
    created = supabase_admin.table("auto_reply_configs").insert(default_row).execute()
    return created.data[0]


@router.put("/{platform_connection_id}", response_model=AutoReplyConfigOut)
def update_config(
    platform_connection_id: UUID,
    payload: AutoReplyConfigUpdate,
    user=Depends(get_current_user),
):
    _verify_ownership(platform_connection_id, user.id)

    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if "custom_rules" in update_data and update_data["custom_rules"] is not None:
        update_data["custom_rules"] = [
            r if isinstance(r, dict) else r.model_dump() for r in update_data["custom_rules"]
        ]

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    result = (
        supabase_admin.table("auto_reply_configs")
        .update(update_data)
        .eq("platform_connection_id", str(platform_connection_id))
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Auto-reply config not found for this connection.")

    return result.data[0]


@router.post("/match", response_model=MatchResponse)
def match_incoming_message(payload: MatchRequest, user=Depends(get_current_user)):
    """
    Given an incoming DM/comment, check this connection's auto-reply config
    and return a matched reply if one applies. Doesn't send anything —
    just resolves what the reply *would* be, for the caller to act on.
    """
    _verify_ownership(payload.platform_connection_id, user.id)

    config_result = (
        supabase_admin.table("auto_reply_configs")
        .select("*")
        .eq("platform_connection_id", str(payload.platform_connection_id))
        .execute()
    )

    if not config_result.data:
        return MatchResponse(matched=False, reply_text=None, source=None)

    config = config_result.data[0]

    if not config["enabled"]:
        return MatchResponse(matched=False, reply_text=None, source=None)

    if payload.is_dm and not config["reply_to_dms"]:
        return MatchResponse(matched=False, reply_text=None, source=None)
    if not payload.is_dm and not config["reply_to_comments"]:
        return MatchResponse(matched=False, reply_text=None, source=None)

    text_lower = payload.incoming_text.lower()

    # 1. Check custom keyword rules first (cheap, no API cost)
    for rule in config.get("custom_rules") or []:
        if rule.get("enabled") and rule.get("keyword", "").lower() in text_lower:
            return MatchResponse(matched=True, reply_text=rule["response"], source="custom_rule")

    # 2. Fall back to AI-powered reply if enabled and no keyword matched
    if config.get("ai_powered") and config.get("ai_prompt"):
        try:
            ai_result = generate_suggestions(
                topic=f"{config['ai_prompt']}\n\nIncoming message: {payload.incoming_text}",
                platform="general",
                suggestion_type="caption",
                num_options=1,
            )
            reply = ai_result[0]["content"] if ai_result else None
            if reply:
                return MatchResponse(matched=True, reply_text=reply, source="ai")
        except Exception:
            pass  # AI failure shouldn't crash the match check — just falls through to no-match

    return MatchResponse(matched=False, reply_text=None, source=None)
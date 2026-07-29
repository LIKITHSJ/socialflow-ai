# routers/ai_suggestions.py
import hashlib
import time
from fastapi import APIRouter, HTTPException, Depends
from schemas.ai_suggestions import SuggestRequest, SuggestResponse, SuggestionOption
from services.gemini_service import generate_suggestions
from database import supabase_admin
from auth_utils import get_current_user

router = APIRouter(prefix="/ai", tags=["ai-suggestions"])

# ---- In-memory TTL cache (SHA-256 keyed) ----
_CACHE_TTL = 3600  # 1 hour
_cache: dict[str, tuple[float, list[dict]]] = {}

def _cache_key(request: SuggestRequest) -> str:
    raw = f"{request.topic.strip().lower()}|{request.platform}|{request.suggestion_type}|{request.num_options}"
    return hashlib.sha256(raw.encode()).hexdigest()

def _get_cached(key: str):
    entry = _cache.get(key)
    if not entry:
        return None
    ts, value = entry
    if time.time() - ts > _CACHE_TTL:
        _cache.pop(key, None)
        return None
    return value

def _set_cached(key: str, value):
    _cache[key] = (time.time(), value)


@router.post("/suggest", response_model=SuggestResponse)
async def suggest(request: SuggestRequest, user = Depends(get_current_user)):
    key = _cache_key(request)
    cached = _get_cached(key)

    if cached is not None:
        raw_suggestions = cached
    else:
        try:
            raw_suggestions = generate_suggestions(
                topic=request.topic,
                platform=request.platform,
                suggestion_type=request.suggestion_type,
                num_options=request.num_options,
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Gemini generation failed: {str(e)}")
        _set_cached(key, raw_suggestions)

    rows_to_insert = [
        {
            "user_id": user.id,  # real Supabase user id, no more stub
            "platform": request.platform,
            "suggestion_type": request.suggestion_type,
            "content": s["content"],
            "metadata": s.get("metadata", {}),
            "used": False,
        }
        for s in raw_suggestions
    ]

    try:
        supabase_admin.table("ai_suggestions").insert(rows_to_insert).execute()
    except Exception as e:
        # Don't fail the whole request if DB insert fails — still return suggestions
        print(f"Warning: failed to insert suggestions into DB: {e}")

    return SuggestResponse(
        suggestions=[SuggestionOption(content=s["content"], metadata=s.get("metadata")) for s in raw_suggestions]
    )
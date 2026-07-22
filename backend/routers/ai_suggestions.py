# routers/ai_suggestions.py
from fastapi import APIRouter, HTTPException
from schemas.ai_suggestions import SuggestRequest, SuggestResponse, SuggestionOption
from services.gemini_service import generate_suggestions
from database import supabase_admin  # stubbed user_id path — swap to get_user_client later

router = APIRouter(prefix="/ai", tags=["ai-suggestions"])

# TODO: replace with real get_current_user dependency once Likhith's auth merges to main
STUB_USER_ID = "00000000-0000-0000-0000-000000000001"

@router.post("/suggest", response_model=SuggestResponse)
async def suggest(request: SuggestRequest):
    try:
        raw_suggestions = generate_suggestions(
            topic=request.topic,
            platform=request.platform,
            suggestion_type=request.suggestion_type,
            num_options=request.num_options,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini generation failed: {str(e)}")

    # Insert each suggestion into ai_suggestions table
    rows_to_insert = [
        {
            "user_id": STUB_USER_ID,
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
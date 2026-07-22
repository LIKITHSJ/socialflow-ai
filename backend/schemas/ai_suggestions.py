# schemas/ai_suggestions.py
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

SuggestionType = Literal["caption", "hashtags", "best_time", "growth_strategy", "tweet", "thread"]
Platform = Literal["twitter", "instagram", "youtube"]

class SuggestRequest(BaseModel):
    topic: str
    platform: Platform
    suggestion_type: SuggestionType
    num_options: int = 3  # how many suggestions to generate

class SuggestionOption(BaseModel):
    content: str
    metadata: Optional[dict] = None

class SuggestResponse(BaseModel):
    suggestions: list[SuggestionOption]
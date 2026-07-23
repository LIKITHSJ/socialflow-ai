# services/gemini_service.py
# services/gemini_service.py
import os
import json
import time
import hashlib
from dotenv import load_dotenv
from google import genai

load_dotenv()  # ← ADD THIS LINE
_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# ---- simple in-memory TTL cache (avoid duplicate Gemini calls on free tier) ----
_CACHE_TTL_SECONDS = 60 * 60  # 1 hour
_cache: dict[str, tuple[float, list[dict]]] = {}


def _cache_key(topic: str, platform: str, suggestion_type: str, num_options: int) -> str:
    raw = f"{topic.strip().lower()}|{platform}|{suggestion_type}|{num_options}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _get_cached(key: str) -> list[dict] | None:
    entry = _cache.get(key)
    if not entry:
        return None
    ts, suggestions = entry
    if time.time() - ts > _CACHE_TTL_SECONDS:
        _cache.pop(key, None)
        return None
    return suggestions


def _build_prompt(topic: str, platform: str, suggestion_type: str, num_options: int) -> str:
    return f"""You are a social media growth expert helping generate {suggestion_type} suggestions
for a {platform} post about: "{topic}".
Generate exactly {num_options} distinct options.
Respond ONLY with valid JSON, no markdown fences, no preamble, in this exact shape:
{{
  "suggestions": [
    {{"content": "...", "metadata": {{}}}},
    ...
  ]
}}"""


def generate_suggestions(topic: str, platform: str, suggestion_type: str, num_options: int) -> list[dict]:
    key = _cache_key(topic, platform, suggestion_type, num_options)
    cached = _get_cached(key)
    if cached is not None:
        return cached

    prompt = _build_prompt(topic, platform, suggestion_type, num_options)
    response = _client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents=prompt,
        config={"response_mime_type": "application/json"},
    )
    parsed = json.loads(response.text)
    suggestions = parsed["suggestions"]

    _cache[key] = (time.time(), suggestions)
    return suggestions
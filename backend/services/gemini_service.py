# services/gemini_service.py
# services/gemini_service.py
import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()  # ← ADD THIS LINE

_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

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
    prompt = _build_prompt(topic, platform, suggestion_type, num_options)

    response = _client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents=prompt,
        config={"response_mime_type": "application/json"},
    )

    parsed = json.loads(response.text)
    return parsed["suggestions"]
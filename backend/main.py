"""
SocialFlow AI — FastAPI backend entrypoint.

Run locally with:
    uvicorn main:app --reload --port 8000
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SocialFlow AI API", version="0.1.0")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "socialflow-ai-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# Routers for posts, social_accounts, ai_generations, etc. get included
# here as the project grows, e.g.:
# from routers import posts
# app.include_router(posts.router, prefix="/posts", tags=["posts"])

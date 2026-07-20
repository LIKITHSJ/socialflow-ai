"""
Supabase client setup for SocialFlow AI backend.

Two clients are exposed:
- `supabase`: uses the anon key, respects Row Level Security. Use this
  for anything done on behalf of a specific logged-in user.
- `supabase_admin`: uses the service_role key, BYPASSES Row Level
  Security. Use this only for trusted server-side jobs (e.g. polling
  analytics across all users, scheduled publishing). Never expose this
  client or its key to the frontend.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# RLS-respecting client (default for request-scoped operations)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Admin client that bypasses RLS — use sparingly and never send to client
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_user_client(access_token: str) -> Client:
    """
    Returns a Supabase client authenticated as a specific user, so that
    RLS policies apply based on that user's auth.uid(). Pass the
    access_token from the Authorization header of an incoming request.
    """
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    client.postgrest.auth(access_token)
    return client

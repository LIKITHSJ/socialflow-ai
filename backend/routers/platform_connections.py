from fastapi import APIRouter, Depends
from database import supabase_admin
from auth_utils import get_current_user

router = APIRouter(prefix="/platform-connections", tags=["platform-connections"])


@router.get("")
def list_connections(user=Depends(get_current_user)):
    result = (
        supabase_admin.table("platform_connections")
        .select("id, platform")
        .eq("user_id", user.id)
        .execute()
    )
    return result.data
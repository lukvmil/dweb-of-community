from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import nanoid
from rid_lib.core import DataObject
from rid_lib.types import KoiLink, KoiSet

from backend.rid_types import CommunityUser
from backend import utils, email_api

router = APIRouter(
    prefix="/api/user"
)

class UserModel(BaseModel):
    name: str
    email: str
    bio: str | None = None
    location: str | None = None
    contact_info: str | None = None

@router.post("")
def create_user(invited_by: str | None = None):
    user = CommunityUser()
    data = {
        "user_id": user.user_id,
        "user_key": utils.generate_secret(15)
    }
    user.cache.write(DataObject(data))
    user.graph.create()
    
    contact_set = KoiSet(nanoid.generate())
    contact_set.graph.create([])
    contact_link = KoiLink(user, contact_set, "has_contacts")
    contact_link.graph.create()
    
    knowledge_set = KoiSet(nanoid.generate())
    knowledge_set.graph.create([])
    knowledge_link = KoiLink(user, knowledge_set, "has_knowledge")
    knowledge_link.graph.create()
    
    if invited_by:
        inviter = CommunityUser(invited_by)
        inviter_link = KoiLink(user, inviter, "invited_by")
        inviter_link.graph.create()
    
    return data

@router.get("/{user_id}")
def read_user(user_id: str):
    user = CommunityUser(user_id)
    data = user.cache.read().json_data
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    del data["user_key"]
    return data

@router.put("/{user_id}")
def update_user(
    user_id: str,
    profile: UserModel,
    user_key = Header(...)
):
    user = CommunityUser(user_id)
    data = user.cache.read().json_data
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    if user_key != data["user_key"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # if data.get("email") != profile.email:
    #     email_api.send(
    #         profile.email,
    #         "Welcome to the Web of Community!",
    #         f"""Hi {profile.name},
            
    #         You are receiving this email because you just joined the Web of Community, or changed your email address. Here is the recovery key for your account:
            
    #         {user_id}/{user_key}
    #         """
    #     )
    
    data.update(profile.model_dump())
    user.cache.write(DataObject(data))
    del data["user_key"]
    return data
    
@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    user_key = Header(...)
):
    user = CommunityUser(user_id)
    data = user.cache.read().json_data
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    if user_key != data["user_key"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user.cache.delete()
    user.graph.delete()
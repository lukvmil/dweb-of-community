from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from backend.rid_types import CommunityUser, CommunityContact
from backend.config import ROOT_ID
from rid_lib.core import DataObject
import time

router = APIRouter(
    prefix="/api/user"
)

class ContactModel(BaseModel):
    note: str | None = None

@router.post("/{user_id}/connect/{other_id}")
def create_contact(
    user_id: str,
    other_id: str,
    contact_info: ContactModel,
    user_key = Header(...)
):
    if other_id == ROOT_ID:
        return
    
    user = CommunityUser(user_id)
    other = CommunityUser(other_id)
    
    data = user.cache.read().json_data
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    if user_key != data["user_key"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    contact_data = contact_info.model_dump()
    timestamp = time.time()
    
    user_connection = CommunityContact(user_id, other_id)
    other_connection = CommunityContact(other_id, user_id)
    
    user_connection_prev = user_connection.cache.read().json_data
    other_connection_prev = other_connection.cache.read().json_data
    
    if not other_connection_prev:
        contact_data["inviter"] = True
    
    user_connection.cache.write(
        DataObject({
            "timestamp": timestamp,
            **(user_connection_prev or {}),
            **contact_data
        })
    )
    
    other_connection.cache.write(
        DataObject({
            "timestamp": timestamp,
            **(other_connection_prev or {})
        })
    )

    user_contacts = user.graph.read_link("has_contacts")
    other_contacts = other.graph.read_link("has_contacts")
    user_contacts.graph.update(add_members=[other])
    other_contacts.graph.update(add_members=[user])
      
@router.get("/{user_id}/connect/{contact_id}")
def read_contact(
    user_id: str, 
    contact_id: str, 
    user_key = Header(...)
):
    user = CommunityUser(user_id)
    data = user.cache.read().json_data
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    if user_key != data["user_key"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return CommunityContact(user_id, contact_id).cache.read().json_data
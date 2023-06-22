from fastapi import APIRouter
from backend import database
from backend.models import *
from backend.utils import *

router = APIRouter(
    prefix="/api"
)

@router.get("/")
def hello():
    return {"mesg": "hello world"}

@router.post("/qr")
def create_qr_code(data: UrlModel):
    img_url = make_qr_code(data.url)
    return {"url": img_url}

@router.get("/user_id_from_key/{user_key}")
def get_key(user_key: str):
    user_id = database.user_id_from_key(user_key)
    return {"id": user_id}

@router.post("/user/{referrer_id}")
def create_user(referrer_id: str):
    user = database.create_user(referrer_id)
    return user

@router.get("/user/{user_id}")
def read_user(user_id: str):
    user = database.read_user(user_id)
    return user

@router.put("/user/{user_key}")
def update_user(user_key: str, updated_user: UserModel):
    user = database.update_user(user_key, updated_user.dict(exclude_unset=True))
    return user

@router.delete("/user/{user_key}")
def delete_user(user_key: str):
    database.delete_user(user_key)

@router.post("/user/{user_key}/connect/{other_id}")
def connect_to_user(user_key: str, other_id: str, connection: ConnectionModel):
    database.connect_to_user(user_key, other_id, connection.dict(exclude_unset=True))
    return {"success": True}
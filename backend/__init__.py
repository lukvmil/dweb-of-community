from fastapi import FastAPI, APIRouter, Response
from backend import database
from backend.models import *
from backend.utils import *
import qrcode
import os

app = FastAPI()
api = APIRouter(
    prefix="/api"
)


@api.get("/")
def hello():
    return {"mesg": "hello world"}

@api.post("/qr/")
def create_qr_code(data: UrlModel):
    img_name = data.url.encode().hex()
    img_path = "frontend/img/" + img_name + ".png"
    img_url = "/img/" + img_name + ".png"
    
    if not os.path.exists(img_path):
        print('making qr')
        img = qrcode.make(data.url)
        img.save(img_path)

    return {"url": img_url}

@api.post("/user/{referrer_id}")
def create_user(referrer_id: str):
    user = database.create_user(referrer_id)
    return user

@api.get("/user/{user_id}")
def read_user(user_id: str):
    user = database.read_user(user_id)
    return user

@api.put("/user/{user_key}")
def update_user(user_key: str, updated_user: UserModel):
    user = database.update_user(user_key, updated_user.dict(exclude_unset=True))
    return user

@api.delete("/user/{user_key}")
def delete_user(user_key: str):
    database.delete_user(user_key)

@api.post("/user/{user_key}/connect/{other_id}")
def connect_to_user(user_key: str, other_id: str, connection: ConnectionModel):
    database.connect_to_user(user_key, other_id, connection.dict(exclude_unset=True))
    return {"success": True}

app.include_router(api)

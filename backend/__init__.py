from fastapi import FastAPI, APIRouter, Response
from backend import database
from backend.models import *
from backend.utils import *

app = FastAPI()
api = APIRouter(
    prefix="/api"
)


@api.get("/")
def hello():
    return {"mesg": "hello world"}

@api.post("/user/{referrer_id}")
def create_user(referrer_id: str):
    user = database.create_user(referrer_id)
    generate_connect_code(user["id"])
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

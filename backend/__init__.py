from fastapi import FastAPI, Header
from backend import database
from backend.models import *
from backend.utils import *

app = FastAPI()

@app.get("/")
def landing_page():
    return {"message": "hello world :)"}

@app.post("/user")
def create_user(new_user: UserModel):
    user = database.create_user(new_user.dict(exclude_unset=True))
    generate_connect_code(user["id"])
    return user

@app.get("/user/{user_id}")
def read_user(user_id: str):
    user = database.read_user(user_id)
    return user

@app.put("/user/{user_key}")
def update_user(user_key: str, updated_user: UserModel):
    user = database.update_user(user_key, updated_user.dict(exclude_unset=True))
    return user

@app.delete("/user/{user_key}")
def delete_user(user_key: str):
    database.delete_user(user_key)

@app.post("/user/{user_key}/connect/{other_id}")
def connect_to_user(user_key: str, other_id: str, connection: ConnectionModel):
    database.connect_to_user(user_key, other_id, connection.dict(exclude_unset=True))
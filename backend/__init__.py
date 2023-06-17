from fastapi import FastAPI, Header
from backend.models import *
from backend import database

app = FastAPI()

@app.get("/")
def landing_page():
    return {"message": "hello world :)"}

@app.post("/user")
def create_user(new_user: NewUserModel):
    user = database.create_user(new_user.dict())
    return user

@app.get("/user/{user_id}")
def read_user(user_id: str):
    user = database.read_user(user_id)
    return user

@app.put("/user/{user_id}")
def update_user(user_id: str, updated_user: UpdateUserModel, user_key: str = Header(...)):
    user = database.update_user(user_id, user_key, updated_user.dict())
    return user

@app.delete("/user/{user_id}")
def delete_user(user_id: str, user_key: str = Header(...)):
    database.delete_user(user_id, user_key)
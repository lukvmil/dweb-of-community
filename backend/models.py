from pydantic import BaseModel

class NewUserModel(BaseModel):
    name: str
    email: str | None
    phone: str | None
    other: dict | None

class UpdateUserModel(BaseModel):
    name: str | None
    email: str | None
    phone: str | None
    other: dict | None
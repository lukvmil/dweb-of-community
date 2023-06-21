from typing import Optional
from pydantic import BaseModel

class UserModel(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    other: Optional[str]

class ConnectionModel(BaseModel):
    info: Optional[str]

class UrlModel(BaseModel):
    url: str
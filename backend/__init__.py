import koi
import qrcode
from fastapi import FastAPI
from backend.routers import user, contact, all
from backend.config import ROOT_ID
import socket

app = FastAPI()
app.include_router(user.router)
app.include_router(contact.router)
app.include_router(all.router)

origin = socket.gethostbyname(socket.gethostname())
invite_url = f"http://{origin}/connect?to={ROOT_ID}&name=Um9vdA"
print("Root URL:", invite_url)
qrcode.make(invite_url).save("root.png")
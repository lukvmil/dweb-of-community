import koi
import qrcode
from fastapi import FastAPI
from backend.routers import user, contact, all, knowledge
from backend.config import ROOT_ID

from apscheduler.schedulers.background import BackgroundScheduler
from koi.vectorstore import VectorInterface

app = FastAPI()
app.include_router(user.router)
app.include_router(contact.router)
app.include_router(all.router)
app.include_router(knowledge.router)


def embed_knowledge():
    # print('hello world')
    VectorInterface.embed_queue()

scheduler = BackgroundScheduler()
scheduler.add_job(embed_knowledge, "interval", seconds=30)
scheduler.start()

@app.on_event("shutdown")
def shutdown():
    print('goodbye')
    scheduler.shutdown()

origin = "community.dweb"
invite_url = f"http://{origin}/connect?to={ROOT_ID}&name=Um9vdA&root"
print("Root URL:", invite_url)
qrcode.make(invite_url).save("root.png")
from fastapi import FastAPI
from backend import api, database, utils
from backend.config import ORIGIN

app = FastAPI()
app.include_router(api.router)

root = database.get_root()
if not root:
    root = database.create_root()

referral_url = ORIGIN + "/connect?to=" + root['id']
qr_code_url = ORIGIN + utils.make_qr_code(referral_url)
print(referral_url)
print(qr_code_url)  

from backend.config import BASE_URL, IMG_PATH
import qrcode

def generate_connect_code(user_id):
    img = qrcode.make(BASE_URL + f"connect?to={user_id}")
    img.save(IMG_PATH + f"{user_id}.png")
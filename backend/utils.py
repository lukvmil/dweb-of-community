import qrcode
import os

def make_qr_code(url):
    img_name = url.encode().hex()
    img_path = "frontend/img/" + img_name + ".png"
    img_url = "/img/" + img_name + ".png"

    if not os.path.exists(img_path):
        img = qrcode.make(url)
        img.save(img_path)

    return img_url
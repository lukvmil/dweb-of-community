import nanoid

secret_char_set = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
def generate_secret(length=10):
    return nanoid.generate(secret_char_set, length)
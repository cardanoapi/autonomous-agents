import secrets
import base64


def generate_random_bytes(length):
    return secrets.token_bytes(length)


def generate_random_base64(length):
    random_bytes = generate_random_bytes(length)
    return base64.b64encode(random_bytes).decode("utf-8")

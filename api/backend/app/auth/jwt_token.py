import jwt
import os


jwt_secret_key = os.environ.get("JWT_SECRET_KEY")


def generate_jwt_token_using_user_address(user_address: str):
    return jwt.encode({"user_address": user_address}, jwt_secret_key, algorithm="HS256")


def decode_jwt_token(token: str):
    return jwt.decode(token, jwt_secret_key, algorithms=["HS256"])

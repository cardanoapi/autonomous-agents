import jwt
from fastapi import Request, HTTPException

from backend.app.auth.jwt_token import decode_jwt_token
from backend.config.database import prisma_connection


async def verify_cookie(request: Request):
    access_token: str | None = request.cookies.get("access_token")

    if access_token is None:
        raise HTTPException(status_code=401, detail="Denied! Access Token is missing")

    try:
        decoded_token = decode_jwt_token(access_token)
        user_address = decoded_token.get("user_address")

        if not user_address:
            raise HTTPException(status_code=401, detail="Invalid token: user address missing")

        user = await prisma_connection.prisma.user.find_unique(where={"address": user_address})

        if user is None:
            raise HTTPException(status_code=401, detail="User does not exist")

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid Access Token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Access Token seems to be corrupted")


async def get_user_if_logged_in(request: Request):
    access_token: str | None = request.cookies.get("access_token")
    if not access_token:
        return None
    try:
        decoded_token = decode_jwt_token(access_token)
        user_address = decoded_token.get("user_address")

        if not user_address:
            return None

        user = await prisma_connection.prisma.user.find_unique(where={"address": user_address})

        if user is None:
            return None

        return user
    except Exception as e:
        return None

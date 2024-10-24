from classy_fastapi import Routable, post, get
from backend.app.utils.signed_data import verify_signed_data, extract_signed_address_from_signature_header
from backend.app.services.user_service import UserService
from backend.app.auth.jwt_token import generate_jwt_token_using_user_address
from fastapi.responses import JSONResponse
from fastapi import Response, HTTPException, Request, Depends
from backend.app.models.user.response_dto import UserResponse
from backend.app.models.user.user_dto import SignatureDataDto, UserCreateDto
from backend.config.api_settings import APISettings
import os
from datetime import datetime, timedelta, timezone
from backend.app.models.user.user_dto import User
from backend.app.auth.cookie_dependency import verify_cookie


class AuthRouter(Routable):

    def __init__(self, user_service: UserService = UserService(), *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.user_service = user_service
        self.settings = APISettings()

    @post("/login")
    async def login_user(self, signed_data: SignatureDataDto, request: Request):
        valid_data = verify_signed_data(hex_signature=signed_data.signature, hex_key=signed_data.key)
        if valid_data:

            # Extract Signed Address and Creates a user using the address , if user with address already exists ,returns the user.
            signed_address = extract_signed_address_from_signature_header(hex_signature=signed_data.signature)

            signed_address_without_network_prefix = signed_address[2:]

            user = await self.user_service.create_user(
                UserCreateDto(address=signed_address_without_network_prefix, isSuperUser=False)
            )

            # Generate JWT Token using user Address
            token = generate_jwt_token_using_user_address(user.address)

            user_response = UserResponse(
                address=user.address, created_at=str(user.created_at), isSuperUser=user.isSuperUser
            )
            response = JSONResponse(content=user_response.dict())

            # Cookie configs
            response.set_cookie(
                key="access_token",
                value=token,
                samesite=self.settings.SAME_SITE,
                secure=self.settings.SECURE,
                httponly=True,
                expires=datetime.now(timezone.utc) + timedelta(15),
                domain=request.url.hostname,
                path="/",
            )

            return response
        else:
            raise HTTPException(status_code=401, detail="Invalid signature")

    @post("/logout")
    async def logout_user(self, response: Response, request: Request):
        if request.cookies.get("access_token") is None:
            raise HTTPException(status_code=401, detail="No access token found")
        response = JSONResponse(content={"status": "logged out"})
        response.set_cookie(
            key="access_token",
            value="",
            expires=datetime.now(timezone.utc),
            samesite=self.settings.SAME_SITE,
            httponly=True,
            secure=self.settings.SECURE,
            domain=request.url.hostname,
            path="/",
        )
        return response

    @post("/status")
    async def check_user_status(self, request: Request, user: User = Depends(verify_cookie)) -> Response:
        # no cookie case is handled by verify cookie function . returns a 401
        is_admin = await self.user_service.check_if_user_is_admin(user.address)
        return JSONResponse(status_code=200, content={"is_admin": is_admin})

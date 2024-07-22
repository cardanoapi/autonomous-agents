from classy_fastapi import Routable, post, get
from pydantic import BaseModel
from backend.app.utils.signed_data import verify_signed_data, extract_signed_address_from_signature_header
from backend.app.services.user_service import UserService
from backend.app.auth.jwt_token import generate_jwt_token_using_user_address
from fastapi.responses import JSONResponse
from fastapi import Response, HTTPException
from backend.app.models.user.response_dto import UserResponse
from backend.app.models.user.user_dto import SignatureDataDto, UserCreateDto
import os


class AuthRouter(Routable):

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.user_service = UserService()
        current_environment = os.environ.get("NODE_ENV")
        self.secure = True if current_environment == "production" else False
        self.domain = "api.agents.cardanoapi.io" if current_environment == "production" else "localhost"

    @post("/login")
    async def login_user(self, signed_data: SignatureDataDto):
        valid_data = verify_signed_data(hex_signature=signed_data.signature, hex_key=signed_data.key)
        if valid_data:

            # Extract Signed Address and Creates a user using the address , if user with address already exists ,returns the user.
            signed_address = extract_signed_address_from_signature_header(hex_signature=signed_data.signature)
            user = await self.user_service.create_user(UserCreateDto(address=signed_address, isSuperUser=False))

            # Generate JWT Token using user Address
            token = generate_jwt_token_using_user_address(user.address)

            user_response = UserResponse(
                address=user.address, created_at=str(user.created_at), is_superUser=user.isSuperUser
            )
            print(user_response.json())
            response = JSONResponse(content=user_response.dict())

            # Cookie configs
            response.set_cookie(
                key="access_token",
                value=token,
                samesite="lax",
                secure=self.secure,
                expires=60 * 60 * 24,
                domain=self.domain,
                path="/",
            )

            return response
        else:
            raise HTTPException(status_code=401, detail="Invalid signature")

    @post("/logout")
    async def logout_user(self, response: Response):
        try:
            response = JSONResponse(content={"status": "logged out"})
            response.delete_cookie("access_token")
            return response
        except Exception as e:
            print(e)
            return {"Status": "Failed", "Info": "Error while logging out"}

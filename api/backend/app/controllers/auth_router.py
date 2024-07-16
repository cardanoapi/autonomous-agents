from classy_fastapi import Routable, post, get
from pydantic import BaseModel
from backend.app.utils.signed_data import verify_signed_data, extract_signed_address_from_signature_header
from backend.app.services.user_service import UserService
from backend.app.auth.jwt_token import generate_jwt_token_using_user_address
from fastapi.responses import JSONResponse
import os


class SignatureDataDto(BaseModel):
    signature: str
    key: str


class AuthRouter(Routable):

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.user_service = UserService()

    @post("/login")
    async def login_user(self, signed_data: SignatureDataDto):
        try:
            valid_data = verify_signed_data(hex_signature=signed_data.signature, hex_key=signed_data.key)
            if valid_data:

                # Extract Signed Address and Creates a user using the address , if user with address already exists ,returns the user.
                signed_address = extract_signed_address_from_signature_header(hex_signature=signed_data.signature)
                user = await self.user_service.create_user(user_address=signed_address)

                # Generate JWT Token using user Address
                token = generate_jwt_token_using_user_address(user.address)

                response = JSONResponse(content={"status": "verified"})

                # Cookie configs
                current_environment = os.environ.get("NODE_ENV")
                secure = True if current_environment == "production" else False
                domain = "api.agents.cardanoapi.io" if current_environment == "production" else "localhost"

                response.set_cookie(
                    key="access_token",
                    value=token,
                    samesite="lax",
                    secure=secure,
                    expires=60 * 60 * 24,
                    domain=domain,
                    path="/",
                )

                return response
            else:
                return {"Status": "Rejected", "Info": "Signed Data Signature Verification Failed"}
        except Exception as e:
            print(e)
            return {"Status": "Rejected", "Info": "Invalid Signature Format"}

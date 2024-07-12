from classy_fastapi import Routable, post, get
from pydantic import BaseModel
from backend.app.utils.signed_data import verify_signed_data, extract_signed_address_from_signature_header
from backend.app.services.user_service import UserService
from backend.app.utils.auth import generate_jwt_token_using_user_address


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
                signed_address = extract_signed_address_from_signature_header(hex_signature=signed_data.signature)
                user = await self.user_service.create_user(user_address=signed_address)
                token = generate_jwt_token_using_user_address(user.address)
                return {"token": token}
            else:
                return {"Status": "Rejected", "Info": "Signed Data Signature Verification Failed"}
        except Exception as e:
            print(e)
            return {"Status": "Rejected", "Info": "Invalid Signature Format"}

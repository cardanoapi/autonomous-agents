from classy_fastapi import Routable, post, get
from pydantic import BaseModel
from backend.app.utils.signed_data import verify_signed_data, extract_signed_address_from_signature_header


class SignatureDataDto(BaseModel):
    signature: str
    key: str


class AuthRouter(Routable):

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

    @post("/login")
    async def login_user(self, signed_data: SignatureDataDto):
        try:
            valid_data = verify_signed_data(hex_signature=signed_data.signature, hex_key=signed_data.key)
            signed_address = extract_signed_address_from_signature_header(hex_signature=signed_data.signature)
            return {"Signed Address": signed_address, "Access": valid_data}
        except:
            return {"Status": "Denied Signed Data Signature Verification Failed"}

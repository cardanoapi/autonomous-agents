from pydantic import BaseModel


class SignatureDataDto(BaseModel):
    signature: str
    key: str

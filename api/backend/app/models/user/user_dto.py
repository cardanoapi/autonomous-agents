from pydantic import BaseModel
from typing import Optional


class SignatureDataDto(BaseModel):
    signature: str
    key: str


class UserCreateDto(BaseModel):
    address: str
    isSuperUser: Optional[bool]

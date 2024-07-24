from pydantic import BaseModel
from typing import Optional, TypedDict, List
from datetime import datetime


class SignatureDataDto(BaseModel):
    signature: str
    key: str


class UserCreateDto(BaseModel):
    address: str
    isSuperUser: Optional[bool]


class User(TypedDict):
    address: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
    isSuperUser: bool

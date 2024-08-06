from pydantic import BaseModel
from typing import Optional, TypedDict
from datetime import datetime


class UserCreateDto(BaseModel):
    address: str
    isSuperUser: Optional[bool]


class User(TypedDict):
    address: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
    isSuperUser: bool

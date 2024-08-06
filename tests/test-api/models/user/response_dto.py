from pydantic import BaseModel
from datetime import datetime


class UserResponse(BaseModel):
    address: str
    created_at: str | datetime
    isSuperUser: bool

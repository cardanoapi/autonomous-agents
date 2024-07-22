from pydantic import BaseModel
from datetime import datetime


class UserResponse(BaseModel):
    address: str
    created_at: datetime
    is_superUser: bool

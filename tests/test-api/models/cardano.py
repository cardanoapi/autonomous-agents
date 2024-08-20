from pydantic import BaseModel


class SignedData(BaseModel):
    signature: str
    key: str

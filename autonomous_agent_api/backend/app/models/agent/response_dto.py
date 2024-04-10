from pydantic import BaseModel
from typing import List


class AgentResponse(BaseModel):
    id: str
    name: str
    instance: int
    action: List[str] = []

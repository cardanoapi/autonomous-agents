from pydantic import BaseModel
from typing import List

class AgentResponse(BaseModel):
    id: str
    name: str
    action: List[str] = []
    triggers: List[str] = []

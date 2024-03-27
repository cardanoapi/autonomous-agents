
from pydantic import BaseModel
from typing import List

class AgentCreateDTO(BaseModel):
    name: str
    action: List[str] = []
    triggers: List[str] = []
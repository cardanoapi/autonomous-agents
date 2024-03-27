
from pydantic import BaseModel,Field
from typing import List

class AgentCreateDTO(BaseModel):
    name: str = Field(..., description="Name of Agent",min_length=1)
    action: List[str] = []
    triggers: List[str] = []
from datetime import datetime

from pydantic import BaseModel, Field
from typing import List, Optional

from models import TriggerResponse


class AgentCreateDTO(BaseModel):
    userAddress: Optional[str] = None
    name: str = Field(..., description="Name of Agent", min_length=1)
    template_id: str
    instance: int = Field()


class AgentUpdateDTO(BaseModel):
    userAddress: Optional[str] = None
    name: Optional[str] = Field(..., description="Name of Agent", min_length=1)
    template_id: Optional[str]
    agent_configurations: Optional[List[TriggerResponse]]
    instance: int = Field()

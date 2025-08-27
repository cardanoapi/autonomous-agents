from datetime import datetime

from pydantic import BaseModel, Field
from typing import List, Optional, Dict

from backend.app.models import TriggerResponse


class AgentCreateDTO(BaseModel):
    userAddress: Optional[str] = None
    name: str = Field(..., description="Name of Agent", min_length=1)
    template_id: Optional[str]
    instance: int = Field()


class AgentUpdateDTO(BaseModel):
    userAddress: Optional[str] = None
    name: Optional[str] = Field(..., description="Name of Agent", min_length=1)
    template_id: Optional[str]
    agent_configurations: Optional[List[TriggerResponse]]
    instance: int = Field()
    agent_config: Optional[Dict] = None

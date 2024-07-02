from datetime import datetime

from pydantic import BaseModel, Field
from typing import List, Optional

from backend.app.models import TriggerResponse


class AgentCreateDTO(BaseModel):
    name: str = Field(..., description="Name of Agent", min_length=1)
    template_id: str
    instance: int


class AgentUpdateDTO(BaseModel):
    name: Optional[str] = Field(..., description="Name of Agent", min_length=1)
    template_id: Optional[str]
    agent_configurations: Optional[List[TriggerResponse]]

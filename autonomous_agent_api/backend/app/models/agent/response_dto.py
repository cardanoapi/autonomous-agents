from datetime import datetime

from pydantic import BaseModel
from typing import List, Optional


class AgentResponse(BaseModel):
    id: str
    name: str
    template_id: str
    instance: int
    index: int
    last_active: Optional[datetime]
    status: Optional[bool]


class AgentKeyResponse(BaseModel):
    agent_private_key: str
    agent_address: str

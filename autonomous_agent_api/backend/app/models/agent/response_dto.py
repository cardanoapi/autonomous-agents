from pydantic import BaseModel
from typing import List


class AgentResponse(BaseModel):
    id: str
    name: str
    template_id: str
    instance: int
    index: int


class AgentKeyResponse(BaseModel):
    agent_private_key: str
    agent_address: str

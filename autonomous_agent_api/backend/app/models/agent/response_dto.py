from pydantic import BaseModel
from typing import List


class AgentResponse(BaseModel):
    id: str
    name: str
    template_id: str
    instance: int

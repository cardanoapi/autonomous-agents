from datetime import datetime

from pydantic import BaseModel, Field
from typing import List, Optional


class AgentCreateDTO(BaseModel):
    name: str = Field(..., description="Name of Agent", min_length=1)
    instance: int

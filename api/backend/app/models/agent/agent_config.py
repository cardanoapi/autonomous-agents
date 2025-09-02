from typing import Optional
from pydantic import BaseModel, Field


class AgentConfig(BaseModel):
    system_prompt: Optional[str] = Field(default=None, description="LLM system prompt for this agent")

    class Config:
        extra = "allow"

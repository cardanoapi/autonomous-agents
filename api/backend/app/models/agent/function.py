from typing import List

from pydantic import BaseModel


class ActionParameters(BaseModel):
    name: str
    value: str


class AgentFunction(BaseModel):
    name: str
    parameters: List[ActionParameters]

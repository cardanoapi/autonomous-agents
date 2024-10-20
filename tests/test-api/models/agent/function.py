from typing import List, Optional, Any

from pydantic import BaseModel


class ActionParameters(BaseModel):
    name: str
    value: Optional[str] | Any


class ValueModel(BaseModel):
    url: str
    dataHash: str


class InfoActionParameters(ActionParameters):
    value: ValueModel


class AgentFunction(BaseModel):
    function_name: str
    parameters: Optional[List[ActionParameters]]

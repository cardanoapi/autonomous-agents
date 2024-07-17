from typing import List, Optional

from pydantic import BaseModel


class ActionParameters(BaseModel):
    name: str
    value: str


class AgentFunction(BaseModel):
    function_name: str
    parameters: Optional[List[ActionParameters]]

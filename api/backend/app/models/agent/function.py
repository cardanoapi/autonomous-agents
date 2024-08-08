from typing import List, Optional, Any

from pydantic import BaseModel


class ActionParameters(BaseModel):
    name: str
    value: Optional[str]


class AgentFunction(BaseModel):
    function_name: str
    parameters: Optional[List[Any]]

from pydantic import BaseModel


class AgentFunctionDetailDto(BaseModel):
    id: str
    name: str
    running: bool
    totalTransactions: int

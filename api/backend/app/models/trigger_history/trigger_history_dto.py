from pydantic import BaseModel
from datetime import datetime


class TriggerHistoryDto(BaseModel):
    agentId: str
    functionName: str
    status: bool
    success: bool
    timestamp: datetime
    message: str

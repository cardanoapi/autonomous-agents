from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel


class TriggerHistoryDto(BaseModel):
    agentId: str
    functionName: str
    status: bool
    success: bool
    timestamp: datetime
    message: str
    triggerType: Optional[str]
    txHash: Optional[str]
    instanceIndex: Optional[int]
    parameters: Optional[Any]
    result: Optional[Any]
    internal: Optional[Any]

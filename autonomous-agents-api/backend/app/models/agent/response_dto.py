from datetime import datetime

from pydantic import BaseModel
from typing import List, Optional


class AgentResponse(BaseModel):
    id: str
    name: str
    template_id: str
    instance: int
    index: int
    last_active: Optional[datetime]


class AgentKeyResponse(BaseModel):
    payment_signing_key: str
    stake_signing_key: str
    stake_verification_key_hash: str
    payment_verification_key_hash: str
    agent_address: str
    drep_id: str

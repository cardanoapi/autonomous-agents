from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from backend.app.models import TriggerResponse


class AgentResponse(BaseModel):
    id: str
    name: str
    template_id: Optional[str]
    instance: int
    index: int
    last_active: Optional[datetime]
    userAddress: Optional[str]
    total_functions: Optional[int]
    is_active: Optional[bool]
    template_name: Optional[str]
    is_drep_registered: Optional[bool]


class AgentResponseWithAgentConfigurations(AgentResponse):
    agent_configurations: Optional[List[TriggerResponse]]


class Delegation(BaseModel):
    pool_id: Optional[str]
    drep_id: Optional[str]


class AgentResponseWithWalletDetails(AgentResponseWithAgentConfigurations):
    agent_address: Optional[str]
    wallet_amount: Optional[float]
    drep_id: Optional[str]
    voting_power: Optional[float]
    is_drep_registered: Optional[bool]
    is_stake_registered: Optional[bool]
    stake_last_registered: Optional[str]
    delegation: Optional[Delegation]


class AgentKeyResponse(BaseModel):
    payment_signing_key: str
    stake_signing_key: str
    stake_verification_key_hash: str
    payment_verification_key_hash: str
    agent_address: str
    drep_id: str

from typing import ByteString, Any

from pydantic import BaseModel


class AgentInstanceWallet(BaseModel):
    agent_id: str
    address: str
    payment_key_hash: Any
    stake_key_hash: Any
    instance_index: int

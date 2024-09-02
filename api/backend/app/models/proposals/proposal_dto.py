from typing import Optional, List, Any
from pydantic import BaseModel


class ProposalResponse(BaseModel):
    id: str
    tx_hash: str
    index: int
    type: str
    details: Any | None
    expiry_date: str
    expiry_epoch_no: int
    created_date: str
    created_epoch_no: int
    url: str
    metadata_hash: str
    title: Optional[str] = None
    abstract: Optional[str] = None
    motivation: Optional[str] = None
    rationale: Optional[str] = None
    metadata: Any
    references: List[str]
    yes_votes: int
    no_votes: int
    abstain_votes: int
    metadata_status: Optional[str] = None
    metadata_valid: bool

from classy_fastapi import get, Routable
from backend.app.services.proposal_service import ProposalService
from fastapi_pagination import Page
from backend.app.models.proposals.proposal_dto import ProposalResponse
from typing import List


class ProposalRouter(Routable):
    def __init__(self, proposal_service: ProposalService = None, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.proposal_service = proposal_service or ProposalService()

    @get("/proposals", response_model=Page)
    async def get_all_proposals(
        self, page: int = 1, pageSize: int = 10, sort: str = "NewestCreated", proposal_type: str = "all"
    ):
        if proposal_type == "internal":
            return await self.proposal_service.get_internal_proposals(page, pageSize)
        else:
            return await self.proposal_service.get_external_proposals(page, pageSize, sort)

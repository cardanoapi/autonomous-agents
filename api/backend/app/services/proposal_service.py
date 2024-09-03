import aiohttp
from fastapi_pagination import Page
from backend.config.database import prisma_connection
from backend.config.api_settings import APISettings


class ProposalService:
    def __init__(self, db_connection=None) -> None:
        self.db = db_connection or prisma_connection
        self.gov_action_api = APISettings().GOV_ACTION_API

    async def get_internal_proposals(self, page: int, pageSize: int):
        internal_proposals = await self.db.prisma.triggerhistory.find_many(
            skip=(page - 1) * pageSize,
            take=pageSize,
            where={"functionName": "createInfoGovAction", "success": True, "status": True},
            order=[{"timestamp": "desc"}],
        )

        no_of_internal_proposals = await self.db.prisma.triggerhistory.count(
            where={"functionName": "createInfoGovAction", "success": True, "status": True}
        )

        results = []
        async with aiohttp.ClientSession() as session:
            for proposal in internal_proposals:
                proposal_data = await self._fetch_proposal_data(session, proposal.txHash)
                if proposal_data:
                    results.append(proposal_data)

        return Page(
            items=results,
            total=no_of_internal_proposals,
            page=page,
            size=pageSize,
            pages=no_of_internal_proposals // pageSize,
        )

    async def get_external_proposals(self, page: int, pageSize: int, sort: str):
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.gov_action_api}/proposal/list?page={page}&pageSize={pageSize}&sort={sort}"
            ) as response:
                response_json = await response.json()
                return Page(
                    items=response_json["elements"],
                    total=response_json["total"],
                    page=response_json["page"],
                    size=response_json["pageSize"],
                    pages=int(response_json["total"]) // int(response_json["pageSize"]),
                )

    async def _fetch_proposal_data(self, session: aiohttp.ClientSession, tx_hash: str):
        async with session.get(f"{self.gov_action_api}/proposal/list?search={tx_hash}") as response:
            if response.status == 200:
                data = await response.json()
                if "elements" in data and data["elements"]:
                    return data["elements"][0]
        return None

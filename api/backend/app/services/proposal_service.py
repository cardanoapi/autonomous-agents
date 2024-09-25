import asyncio
from typing import Any

import aiohttp
from aiohttp import ClientSession
from fastapi_pagination import Page

from backend.app.controllers.trigger_history_router import TriggerHistory
from backend.config.api_settings import APISettings
from backend.config.database import prisma_connection


class ProposalService:
    def __init__(self, db_connection=None) -> None:
        self.db = db_connection or prisma_connection
        self.gov_action_api = APISettings().GOV_ACTION_API

    async def get_internal_proposals(self, page: int = 1, pageSize: int = 10, search: str | None = None):

        filters = {
            "functionName": {
                "in": [
                    "createInfoGovAction",
                    "proposalNewConstitution",
                    "treasuryWithdrawal",
                    "noConfidence",
                    "updateCommittee",
                ]
            },
            "success": True,
            "status": True,
        }

        if search:
            if len(search) > 2 and search[-2:] == "#0":
                search = search[:-2]

            filters["txHash"] = {"contains": search}
        try:
            internal_proposals = await self.db.prisma.triggerhistory.find_many(
                skip=(page - 1) * pageSize,
                take=pageSize,
                where=filters,
                order=[{"timestamp": "desc"}],
            )
        except:
            internal_proposals = []
        no_of_internal_proposals = await self.db.prisma.triggerhistory.count(
            where={"functionName": "createInfoGovAction", "success": True, "status": True}
        )
        results = []
        async with aiohttp.ClientSession() as session:
            async with asyncio.TaskGroup() as tg:
                for proposal in internal_proposals:
                    tg.create_task(self.add_agent_detail_in_proposal(proposal, results, session))
        return Page(
            items=results,
            total=no_of_internal_proposals,
            page=page,
            size=pageSize,
            pages=no_of_internal_proposals // pageSize,
        )

    async def get_external_proposals(self, page: int, pageSize: int, sort: str, search: str | None = None):
        search_url = f"{self.gov_action_api}/proposal/list?page={page}&pageSize={pageSize}&sort={sort}"
        if search:
            search_url = f"{self.gov_action_api}/proposal/list?search={search}"
        async with aiohttp.ClientSession() as session:
            async with session.get(search_url) as response:
                response_json = await response.json()
                result = []
                for proposal in response_json["elements"]:
                    if proposal["txHash"]:
                        try:
                            internal_proposal = await self.db.prisma.triggerhistory.find_first(
                                where={"txHash": proposal["txHash"]}
                            )
                        except:
                            internal_proposal = False

                        if internal_proposal:
                            agent = await self.db.prisma.agent.find_first(
                                where={"id": internal_proposal.agentId},
                            )
                            proposal["agentId"] = agent.id
                            proposal["agentName"] = agent.name

                        result.append(proposal)

                return Page(
                    items=result,
                    total=response_json["total"],
                    page=max(response_json["page"] | 0, 1),
                    size=response_json["pageSize"],
                    pages=max(int(response_json["total"]) // int(response_json["pageSize"]) | 0, 1),
                )

    async def add_agent_detail_in_proposal(self, proposal: TriggerHistory, results: [Any], session: ClientSession):
        proposal_data = await self._fetch_proposal_data(session, proposal.txHash)
        if proposal_data:
            agent = await self.db.prisma.agent.find_unique(
                where={"id": proposal.agentId},
            )
            results.append(proposal_data | {"agentId": proposal.agentId, "agentName": agent.name})

    async def _fetch_proposal_data(self, session: aiohttp.ClientSession, tx_hash: str):
        async with session.get(f"{self.gov_action_api}/proposal/list?search={tx_hash}") as response:
            if response.status == 200:
                data = await response.json()
                if "elements" in data and data["elements"]:
                    return data["elements"][0]
        return None

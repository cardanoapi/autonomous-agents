import asyncio
from typing import Any, List

import aiohttp
from fastapi_pagination import Page

from backend.app.exceptions import HTTPException
from backend.app.models.trigger_history.trigger_history_dto import TriggerHistoryDto
from backend.config.api_settings import api_settings
from backend.config.database import prisma_connection
from backend.config.logger import logger


class ProposalService:
    def __init__(self, db_connection=None) -> None:
        self.db = db_connection or prisma_connection

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
            "txHash": {"not": None},
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
        async with aiohttp.ClientSession() as session:
            async with asyncio.TaskGroup() as tg:
                for index, proposal in enumerate(internal_proposals):
                    tg.create_task(
                        self.add_metadata_and_agent_detail_in_internal_proposal(proposal, index, internal_proposals)
                    )
        return Page(
            items=[proposal for proposal in internal_proposals if proposal],
            total=no_of_internal_proposals,
            page=page,
            size=pageSize,
            pages=no_of_internal_proposals // pageSize,
        )

    async def add_metadata_and_agent_detail_in_internal_proposal(
        self, proposal: TriggerHistoryDto, index: int, results: list[Any]
    ):
        url = f"{api_settings.DB_SYNC_BASE_URL}/proposal?proposal={proposal.txHash}"
        proposal_data = await self._fetch_proposal_data(url)
        if not proposal_data:
            results[index] = ""
            return
        agent = await self.db.prisma.agent.find_unique(
            where={"id": proposal.agentId},
        )
        proposal_dict = proposal_data | {"agentId": proposal.agentId, "agentName": agent.name}
        if proposal_dict.get("metadataHash") and proposal_dict.get("url"):
            url = proposal_dict.get("url")
            metadata_hash = proposal_dict.get("metadataHash")
            await self._fetch_metadata(metadata_hash, url, proposal_dict)
        if proposal_dict:
            results[index] = proposal_dict

    async def get_external_proposals(self, page: int, pageSize: int, sort: str, search: str | None = None):
        search_url = f"{api_settings.DB_SYNC_BASE_URL}/proposal?page={page}&size={pageSize}&sort={sort}"
        if search:
            search_url = f"{api_settings.DB_SYNC_BASE_URL}/proposal?proposal={search}"

        async with aiohttp.ClientSession() as session:
            async with session.get(search_url) as response:
                if response.status != 200:
                    logger.error("Error fetching External Proposals , DB Sync upstream service error")
                    raise HTTPException(
                        status_code=500, content="Error fetching External Proposals , DB Sync upstream service error"
                    )
                response_json = await response.json()

        async with asyncio.TaskGroup() as tg:
            for index, proposal in enumerate(response_json["items"]):
                tg.create_task(self.add_agent_in_external_proposals(index, proposal, response_json["items"]))
                if proposal.get("metadataHash") and proposal.get("url"):
                    tg.create_task(self._fetch_metadata(proposal.get("metadataHash"), proposal.get("url"), proposal))
        return Page(
            items=response_json["items"],
            total=response_json["totalCount"],
            page=max(response_json["page"] | 0, 1),
            size=response_json["size"],
            pages=max(int(response_json["totalCount"]) // int(response_json["size"]) | 0, 1),
        )

    async def add_agent_in_external_proposals(self, index: int, proposal: Any, proposals: List[Any]):
        if proposal["txHash"]:
            try:
                internal_proposal = await self.db.prisma.triggerhistory.find_first(where={"txHash": proposal["txHash"]})
                if internal_proposal:
                    agent = await self.db.prisma.agent.find_first(where={"id": internal_proposal.agentId})
                    proposal["agentId"] = agent.id
                    proposal["agentName"] = agent.name
            except:
                logger.error("Proposal with given id not found")
                raise HTTPException(status_code=500, content="Proposal with given id not found")
        proposals[index] = proposal

    async def _fetch_metadata(self, metadata_hash: str, url: str, proposal_dict: Any):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{api_settings.METADATA_BASE_URL}/metadata?url={url}&hash={metadata_hash}"
                ) as metadata_resp:
                    metadata_resp_json = await metadata_resp.json()
                    if "hash" in metadata_resp_json:
                        proposal_dict["title"] = (
                            metadata_resp_json.get("metadata", {}).get("body", {}).get("title", None)
                        )
        except:
            pass
            # raise HTTPException(status_code = 500, content='MetaData Service Error')

    async def _fetch_proposal_data(self, url: str):
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 500:
                    logger.error("Error fetching proposal MetaData , DB Sync Upstream service error")
                    raise HTTPException(
                        status_code=500, content="Error fetching proposal MetaData , DB Sync Upstream service error"
                    )
                if response.status == 200:
                    data = await response.json()
                    if "items" in data and data["items"]:
                        return data["items"][0]
        return None

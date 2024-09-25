import asyncio
import base64
from typing import Any

import aiohttp

from backend.app.repositories.agent_repository import AgentRepository
from backend.config.api_settings import APISettings
from backend.config.database import prisma_connection


class DrepService:
    def __init__(self):
        self.gov_action_api = APISettings().GOV_ACTION_API
        self.agent_repository = AgentRepository()
        self.db = prisma_connection
        self.metadata_api = APISettings().METADATA_API

    async def fetch_internal_dreps(self, page: int, page_size: int, search: str | None):

        if search:
            try:
                internalDrep = await self.db.prisma.agentwalletdetails.find_first(
                    where={"stake_key_hash": self.convert_hex_to_base64(search)}
                )
                agents = [
                    await self.db.prisma.agent.find_first(where={"id": internalDrep.agent_id, "deleted_at": None})
                ]
            except:
                agents = []
        else:
            agents = await self.db.prisma.agent.find_many(
                where={"deleted_at": None, "is_drep_registered": True},
                skip=(page - 1) * page_size,
                take=page_size,
                order=[{"last_active": "desc"}],
            )
        result = []

        async with aiohttp.ClientSession() as session:
            for agent in agents:
                agent_details = await self.agent_repository.retreive_agent_key(agent.id)
                drep_dict = {}
                async with session.get(f"{self.gov_action_api}/drep/list?search={agent_details.drep_id}") as response:
                    response_json = await response.json()
                    if response_json["elements"]:
                        if agent_details.drep_id == response_json["elements"][0]["drepId"]:
                            drep_dict = response_json["elements"][0]
                if drep_dict.get("metadataHash") and drep_dict.get("url"):
                    url = drep_dict.get("url")
                    metadata_hash = drep_dict.get("metadataHash")
                    async with session.get(
                        f"{self.metadata_api}/metadata?url={url}&hash={metadata_hash}"
                    ) as metadata_resp:
                        metadata_resp_json = await metadata_resp.json()
                        if "hash" in metadata_resp_json:
                            drep_dict["givenName"] = metadata_resp_json["metadata"]["body"]["givenName"]
                if drep_dict:
                    result.append(drep_dict | {"agentId": agent.id, "agentName": agent.name})
        return result

    async def fetch_external_dreps(self, page: int, page_size: int, search: str | None):

        if search:
            fetchUrl = f"{self.gov_action_api}/drep/list?search={search}"
        else:
            fetchUrl = f"{self.gov_action_api}/drep/list?page={page}&pageSize={page_size}"

        async with aiohttp.ClientSession() as session:
            async with asyncio.TaskGroup() as tg:
                async with session.get(fetchUrl) as response:
                    response_json = await response.json()
                    for drep in response_json["elements"]:
                        if drep["metadataHash"] and drep["url"]:
                            url = drep["url"]
                            metadata_hash = drep["metadataHash"]
                            tg.create_task(self.fetch_metadata_for_drep(metadata_hash, url, drep))

                            try:
                                internalDrep = await self.db.prisma.agentwalletdetails.find_first(
                                    where={"stake_key_hash": self.convert_hex_to_base64(drep["drepId"])}
                                )
                            except Exception as e:
                                internalDrep = False

                            if internalDrep:
                                agent = await self.db.prisma.agent.find_first(
                                    where={"id": internalDrep.agent_id, "deleted_at": None}
                                )
                                if agent:
                                    drep["agentId"] = agent.id
                                    drep["agentName"] = agent.name

            return {
                "items": response_json["elements"],
                "total": response_json["total"],
                "page": max(response_json["page"], 1),
                "size": response_json["pageSize"],
                "pages": max(int(response_json["total"]) // int(response_json["pageSize"]), 1),
            }

    async def fetch_metadata_for_drep(self, metadata_hash: str, url: str, drep: Any):
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.metadata_api}/metadata?url={url}&hash={metadata_hash}") as metadata_resp:
                metadata_resp_json = await metadata_resp.json()
                if "hash" in metadata_resp_json:
                    drep["givenName"] = metadata_resp_json.get("metadata", {}).get("body", {}).get("givenName", None)

    def convert_hex_to_base64(self, hex_string):
        try:
            binary_data = bytes.fromhex(hex_string)
            base64_result = base64.b64encode(binary_data).decode("utf-8")
            return base64_result
        except:
            return hex_string

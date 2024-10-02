import asyncio
import base64
from typing import Any

import aiohttp
from aiohttp import ClientSession
from prisma import Base64
from prisma.models import Agent

from backend.app.repositories.agent_repository import AgentRepository
from backend.config.api_settings import api_settings
from backend.config.database import prisma_connection


class DrepService:
    def __init__(self):
        self.agent_repository = AgentRepository()
        self.db = prisma_connection

    async def fetch_internal_dreps(self, page: int, page_size: int, search: str | None):
        total_count = 0
        if search:
            try:
                internalDrep = await self.db.prisma.agentwalletdetails.find_first(
                    where={"stake_key_hash": convert_string_to_base64(search)}
                )
                agents = [
                    await self.db.prisma.agent.find_first(
                        include={"wallet_details": True}, where={"id": internalDrep.agent_id, "deleted_at": None}
                    )
                ]
            except:
                agents = []
        else:
            [agents, total_count] = await asyncio.gather(
                self.db.prisma.agent.find_many(
                    include={"wallet_details": True},
                    where={"deleted_at": None, "is_drep_registered": True},
                    skip=(page - 1) * page_size,
                    take=page_size,
                    order={"last_active": "desc"},
                ),
                self.db.prisma.agent.count(where={"deleted_at": None, "is_drep_registered": True}),
            )
        async with aiohttp.ClientSession() as session:
            async with asyncio.TaskGroup() as tg:
                for index, agent in enumerate(agents):
                    tg.create_task(self.fetch_metadata(agent, index, agents, session))
        return [agents, total_count]

    async def fetch_metadata(self, agent: Agent, index: int, agents: [Any], session: ClientSession):
        drep_dict = {}
        drep_id = convert_base64_to_hex(agent.wallet_details[0].stake_key_hash)
        async with session.get(f"{api_settings.DB_SYNC_API}/drep?dRepId={drep_id}") as response:
            response_json = await response.json()
            if response_json["items"]:
                if drep_id == response_json["items"][0]["drepId"]:
                    drep_dict = response_json["items"][0]
        if drep_dict.get("metadataHash") and drep_dict.get("url"):
            url = drep_dict.get("url")
            metadata_hash = drep_dict.get("metadataHash")
            try:
                async with session.get(
                    f"{api_settings.METADATA_API}/metadata?url={url}&hash={metadata_hash}"
                ) as metadata_resp:
                    metadata_resp_json = await metadata_resp.json()
                    if "hash" in metadata_resp_json:
                        drep_dict["givenName"] = metadata_resp_json["metadata"]["body"]["givenName"]
            except:
                pass
                # raise HTTPException(status_code = 500,content='MetaData Service Error')
        if drep_dict:
            drep_dict = drep_dict | {"agentId": agent.id, "agentName": agent.name}
            agents[index] = drep_dict

    async def fetch_external_dreps(self, page: int, page_size: int, search: str | None):

        if search:
            fetchUrl = f"{api_settings.DB_SYNC_API}/drep?dRepId={search}"
        else:
            fetchUrl = f"{api_settings.DB_SYNC_API}/drep?page={page}&size={page_size}"

        async with aiohttp.ClientSession() as session:
            async with asyncio.TaskGroup() as tg:
                async with session.get(fetchUrl) as response:
                    response_json = await response.json()
                    for drep in response_json["items"]:
                        if drep["metadataHash"] and drep["url"]:
                            url = drep["url"]
                            metadata_hash = drep["metadataHash"]
                            tg.create_task(self.fetch_metadata_for_drep(metadata_hash, url, drep))

                            try:
                                internalDrep = await self.db.prisma.agentwalletdetails.find_first(
                                    where={"stake_key_hash": convert_hex_to_base64(drep["drepId"])}
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
                "items": response_json["items"],
                "total": response_json["totalCount"],
                "page": max(response_json["page"], 1),
                "size": response_json["size"],
                "pages": max(int(response_json["totalCount"]) // int(response_json["size"]), 1),
            }

    async def fetch_metadata_for_drep(self, metadata_hash: str, url: str, drep: Any):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{api_settings.METADATA_API}/metadata?url={url}&hash={metadata_hash}"
                ) as metadata_resp:
                    metadata_resp_json = await metadata_resp.json()
                    if "hash" in metadata_resp_json:
                        drep["givenName"] = (
                            metadata_resp_json.get("metadata", {}).get("body", {}).get("givenName", None)
                        )
        except:
            pass
            # raise HTTPException(status_code = 500, content='MetaData Service Error')


def convert_string_to_base64(string):
    try:
        if string.startswith("drep"):
            pass
        binary_data = bytes.fromhex(string)
        base64_result = base64.b64encode(binary_data).decode("utf-8")
        return base64_result
    except:
        return string


def convert_base64_to_hex(base_64_string: Base64):
    try:
        return base_64_string.decode().hex()
    except:
        return ""

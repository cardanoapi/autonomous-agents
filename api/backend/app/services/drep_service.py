import aiohttp
from backend.config.api_settings import APISettings
from backend.app.repositories.agent_repository import AgentRepository
from backend.config.database import prisma_connection


class DrepService:
    def __init__(self):
        self.gov_action_api = APISettings().GOV_ACTION_API
        self.agent_repository = AgentRepository()
        self.db = prisma_connection

    async def fetch_internal_dreps(self, page: int, page_size: int):
        agents = await self.db.prisma.agent.find_many(
            where={"deleted_at": None}, skip=(page - 1) * page_size, take=page_size, order=[{"last_active": "desc"}]
        )
        result = []
        async with aiohttp.ClientSession() as session:
            for agent in agents:
                agent_details = await self.agent_repository.retreive_agent_key(agent.id)
                async with session.get(f"{self.gov_action_api}/drep/list?search={agent_details.drep_id}") as response:
                    response_json = await response.json()
                    if response_json["elements"]:
                        if agent_details.drep_id == response_json["elements"][0]["drepId"]:
                            result.append(response_json["elements"][0] | {"agentId": agent.id, "agentName": agent.name})
        return result

    async def fetch_external_dreps(self, page: int, page_size: int):
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.gov_action_api}/drep/list?page={page}&pageSize={page_size}") as response:
                response_json = await response.json()
                return {
                    "items": response_json["elements"],
                    "total": response_json["total"],
                    "page": response_json["page"],
                    "size": response_json["pageSize"],
                    "pages": int(response_json["total"]) // int(response_json["pageSize"]),
                }

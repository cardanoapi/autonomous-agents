from fastapi_pagination import Page
from classy_fastapi import get, Routable
from backend.config.database import prisma_connection
from backend.config.api_settings import APISettings
from backend.app.repositories.agent_repository import AgentRepository
import aiohttp


class DrepRouter(Routable):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.gov_action_api = APISettings().GOV_ACTION_API
        self.agent_repository = AgentRepository()
        self.db = prisma_connection

    @get("/dreps", response_model=Page)
    async def get_all_dreps(self, page: int = 1, pageSize: int = 10, drep_type: str = "all"):

        if drep_type == "internal":
            agents = await self.db.prisma.agent.find_many(
                where={"deleted_at": None}, skip=(page - 1) * pageSize, take=pageSize, order=[{"last_active": "desc"}]
            )
            result = []
            for agent in agents:
                agentDetails = await self.agent_repository.retreive_agent_key(agent.id)
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        f"{self.gov_action_api}/drep/list?search={agentDetails.drep_id}"
                    ) as response:
                        response_json = await response.json()
                        if len(response_json["elements"]) > 0:
                            if agentDetails.drep_id == response_json["elements"][0]["drepId"]:
                                result.append(response_json["elements"][0])
            return Page(items=result, total=len(result), page=page, size=pageSize, pages=1)

        else:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.gov_action_api}/drep/list?page={page}&pageSize={pageSize}") as response:
                    response_json = await response.json()
                    return Page(
                        items=response_json["elements"],
                        total=response_json["total"],
                        page=response_json["page"],
                        size=response_json["pageSize"],
                        pages=int(response_json["total"]) // int(response_json["pageSize"]),
                    )

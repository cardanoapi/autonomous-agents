from http import HTTPStatus
from typing import List

from classy_fastapi import Routable, get, post, put, delete
from fastapi import HTTPException

from backend.app.models.AgentDto.agent_dto import AgentCreateDTO
from backend.app.services.agent_service import AgentService
from backend.app.models.AgentDto.response_dto import AgentResponse
from backend.dependency import get_agent_service


class AgentRouter(Routable):
    def __init__(self, agent_service: AgentService = get_agent_service(), *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.agent_service = agent_service

    @post("/agents/", status_code=HTTPStatus.CREATED)
    async def create_agent(self, agent_data: AgentCreateDTO):
        agent = await self.agent_service.create_agent(agent_data)
        return agent

    @get("/agents/", response_model=List[AgentResponse])
    async def list_agents(self):
        agents = await self.agent_service.list_agents()
        return agents

    @get("/agents/{agent_id}", response_model=AgentResponse)
    async def get_agent(self, agent_id: str):
        agent = await self.agent_service.get_agent(agent_id)
        return agent

    @put("/agents/{agent_id}", status_code=HTTPStatus.OK)
    async def update_agent(self, agent_id: str, agent_data: AgentCreateDTO):
        updated_agent = await self.agent_service.update_agent(agent_id, agent_data)
        return updated_agent

    @delete("/agents/{agent_id}", status_code=HTTPStatus.NO_CONTENT)
    async def delete_agent(self, agent_id: str):
        await self.agent_service.delete_agent(agent_id)

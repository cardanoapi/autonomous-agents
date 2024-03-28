# agent_service.py
from typing import List

from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.models.response_dto import AgentResponse
from backend.app.repositories.agent_repository import AgentRepository


class AgentService:
    def __init__(self, agent_repository: AgentRepository):
        self.agent_repository = agent_repository

    async def create_agent(self, agent_data: AgentCreateDTO):
        return await self.agent_repository.save_agent(agent_data)

    async def list_agents(self) -> List[AgentResponse]:
        return await self.agent_repository.retrieve_agents()

    async def get_agent(self, agent_id: str) -> AgentResponse:
        return await self.agent_repository.retrieve_agent(agent_id)

    async def update_agent(self, agent_id: str, agent_data: AgentCreateDTO) -> AgentResponse:
        return await self.agent_repository.modify_agent(agent_id, agent_data)

    async def delete_agent(self, agent_id: str) -> None:
        await self.agent_repository.remove_agent(agent_id)

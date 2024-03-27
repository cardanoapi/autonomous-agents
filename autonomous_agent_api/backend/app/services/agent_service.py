# agent_service.py

from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.repositories.agent_repository import AgentRepository

class AgentService:
    async def create_agent(self, agent_data: AgentCreateDTO):
        agent_repository = AgentRepository()
        return await agent_repository.save_agent(agent_data)


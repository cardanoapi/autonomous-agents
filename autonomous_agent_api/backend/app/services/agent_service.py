from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.repositories.agent_repository import AgentRepository

class AgentService:
    def __init__(self):
        self.agent_repository = AgentRepository()

    async def create_agent(self, agent_data: AgentCreateDTO):
        return await self.agent_repository.create_agent(agent_data)
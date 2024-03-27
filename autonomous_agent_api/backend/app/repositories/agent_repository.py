import uuid
from backend.app.models.agent_dto import AgentCreateDTO
from backend.config.database import prisma_connection

class AgentRepository:
    async def save_agent(self, agent_data: AgentCreateDTO):
        # Generate a random UUID for the agent ID
        agent_id = str(uuid.uuid4())
        agent_data_dict = agent_data.dict()
        agent_data_dict["id"] = agent_id

        async with prisma_connection:
            agent = await prisma_connection.prisma.agent.create(data=agent_data_dict)
        return agent

import uuid
from datetime import datetime
from typing import List

from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.models.response_dto import AgentResponse
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

    async def list_agents(self) -> List[AgentResponse]:
        async with prisma_connection:
            agents = await prisma_connection.prisma.agent.find_many()
            return agents

    async def get_agent(self, agent_id: str) -> AgentResponse:
        async with prisma_connection:
            agent = await prisma_connection.prisma.agent.find_first(where={"id": agent_id})
            return agent

    async def update_agent(self, agent_id: str, agent_data: AgentCreateDTO) -> AgentResponse:
        async with prisma_connection:
            updated_agent = await prisma_connection.prisma.agent.update(
                where={"id": agent_id},
                data=agent_data.dict(exclude_unset=True)
            )
            return updated_agent

    async def delete_agent(self, agent_id: str) -> None:
        async with prisma_connection:
            await prisma_connection.prisma.agent.update(
                where={"id": agent_id},
                data={"deleted_at": datetime.datetime.utcnow()}
            )




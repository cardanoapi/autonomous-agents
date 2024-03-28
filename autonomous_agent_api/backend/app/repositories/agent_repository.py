import uuid
from datetime import datetime,UTC


from typing import List

from fastapi import HTTPException

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

    async def retrieve_agents(self) -> List[AgentResponse]:
        async with prisma_connection:
            agents = await prisma_connection.prisma.agent.find_many(where={"deleted_at": None})
            return agents

    async def retrieve_agent(self, agent_id: str) -> AgentResponse:
        async with prisma_connection:
            agent = await prisma_connection.prisma.agent.find_first(where={"id": agent_id})
            if agent is None:
                raise HTTPException(status_code=404, detail="Agent not found")
            elif agent.deleted_at is not None:
                raise HTTPException(status_code=404, detail="Agent has been deleted")
            else:
                return agent

    async def modify_agent(self, agent_id: str, agent_data: AgentCreateDTO) -> AgentResponse:
        async with prisma_connection:
            agent = await prisma_connection.prisma.agent.find_first(where={"id": agent_id})
            if agent is None:
                raise HTTPException(status_code=404, detail="Agent not found")
            elif agent.deleted_at is not None:
                raise HTTPException(status_code=404, detail="Agent has been deleted")

            updated_agent = await prisma_connection.prisma.agent.update(
                where={"id": agent_id},
                data=agent_data.dict(exclude_unset=True)
            )
            return updated_agent

    async def remove_agent(self, agent_id: str) -> None:
        async with prisma_connection:
            agent = await prisma_connection.prisma.agent.find_first(where={"id": agent_id})
            if agent is None:
                raise HTTPException(status_code=404, detail="Agent not found")
            elif agent.deleted_at is not None:
                raise HTTPException(status_code=404, detail="Agent has already been deleted")

            await prisma_connection.prisma.agent.update(
                where={"id": agent_id},
                data={"deleted_at": datetime.now(UTC)}
            )

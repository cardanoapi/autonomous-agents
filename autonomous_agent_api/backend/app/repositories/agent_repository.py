import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException
from backend.app.models.agent.agent_dto import AgentCreateDTO
from backend.app.models.agent.response_dto import AgentResponse
from backend.config.database import prisma_connection


class AgentRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def save_agent(self, agent_data: AgentCreateDTO):
        # Generate a random UUID for the agent ID
        agent_id = str(uuid.uuid4())
        agent_data_dict = agent_data.dict()
        agent_data_dict["id"] = agent_id
        agent_data_dict["created_at"] = datetime.now(timezone.utc)
        agent_data_dict["updated_at"] = datetime.now(timezone.utc)

        async with self.db:
            agent = await self.db.prisma.agent.create(data=agent_data_dict)
        agent_response = AgentResponse(
            id=agent_id,
            name=agent_data.name,
            instance=agent_data.instance,
        )

        return agent_response

    async def retrieve_agents(self) -> List[AgentResponse]:
        async with self.db:
            agents = await self.db.prisma.agent.find_many(where={"deleted_at": None})
            if agents is None:
                raise HTTPException(status_code=404, detail="No Agents not found")
            else:
                return agents

    async def retrieve_agent(self, agent_id: str) -> Optional[AgentResponse]:
        async with self.db:
            agent = await self.db.prisma.agent.find_first(where={"id": agent_id, "deleted_at": None})
            if agent is None:
                raise HTTPException(status_code=404, detail="Agent not found")
            else:
                return agent

    async def modify_agent(self, agent_id: str, agent_data: AgentCreateDTO) -> Optional[AgentResponse]:
        async with self.db:
            agent = await self.db.prisma.agent.find_first(where={"id": agent_id})
            if agent is None or agent.deleted_at is not None:
                raise HTTPException(status_code=404, detail="Agent not found")

            updated_data = agent_data.dict(exclude_unset=True)
            updated_data["updated_at"] = datetime.now(timezone.utc)

            updated_agent = await self.db.prisma.agent.update(where={"id": agent_id}, data=updated_data)
            return updated_agent

    async def remove_agent(self, agent_id: str) -> bool:
        async with self.db:
            agent = await self.db.prisma.agent.find_first(where={"id": agent_id})
            if agent is None:
                return False
            elif agent.deleted_at is not None:
                return True

            await self.db.prisma.agent.update(where={"id": agent_id}, data={"deleted_at": datetime.now(timezone.utc)})
            return True

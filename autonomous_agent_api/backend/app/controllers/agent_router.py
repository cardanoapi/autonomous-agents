# agent_router.py
from typing import List

from fastapi import APIRouter, HTTPException, status,Depends
from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.services.agent_service import AgentService
from backend.app.models.response_dto import AgentResponse
from pydantic import ValidationError
from backend.dependency import get_agent_service

class AgentRouter:
    def __init__(self, agent_service: AgentService = Depends(get_agent_service)):
        self.router = APIRouter(tags=['agent'])
        self.agent_service = agent_service

        self.router.post("/create_agents/", status_code=status.HTTP_201_CREATED)(self.create_agent)
        self.router.get("/agents/", response_model=List[AgentResponse])(self.list_agents)
        self.router.get("/agents/{agent_id}", response_model=AgentResponse)(self.get_agent)
        self.router.put("/agents/{agent_id}", status_code=status.HTTP_200_OK)(self.update_agent)
        self.router.delete("/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)(self.delete_agent)

    async def create_agent(self, agent_data: AgentCreateDTO) -> AgentResponse:
        try:
            agent = await self.agent_service.create_agent(agent_data)
            return agent
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def list_agents(self) -> List[AgentResponse]:
        agents = await self.agent_service.list_agents()
        return agents

    async def get_agent(self, agent_id: str) -> AgentResponse:
        agent = await self.agent_service.get_agent(agent_id)
        return agent

    async def update_agent(self, agent_id: str, agent_data: AgentCreateDTO) -> AgentResponse:
        updated_agent = await self.agent_service.update_agent(agent_id, agent_data)
        return updated_agent

    async def delete_agent(self, agent_id: str) -> None:
        await self.agent_service.delete_agent(agent_id)
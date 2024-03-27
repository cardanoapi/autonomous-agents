# agent_router.py

from fastapi import APIRouter, HTTPException
from fastapi import status
from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.services.agent_service import AgentService
from backend.container import Container

router = APIRouter(tags=['agent'])
agent_service = AgentService()

class AgentController:
    def __init__(self, agent_service: Container.agent_service = Container.agent_service()):
        self.agent_service = agent_service

@router.post("/create_agents/", status_code=status.HTTP_201_CREATED)
async def create_agent(self, agent_data: AgentCreateDTO):
        try:
            agent = await self.agent_service.create_agent(agent_data)
            return agent
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

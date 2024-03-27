# agent_router.py

from fastapi import APIRouter, HTTPException, status
from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.services.agent_service import AgentService
from backend.app.repositories.agent_repository import AgentRepository
from pydantic import ValidationError

router = APIRouter(tags=['agent'])
agent_service = AgentService()



@router.post("/create_agents/", status_code=status.HTTP_201_CREATED)
async def create_agent(agent_data: AgentCreateDTO):
    try:
        agent = await agent_service.create_agent(agent_data)
        return agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

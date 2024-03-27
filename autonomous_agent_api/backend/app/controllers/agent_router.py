# agent_router.py

from fastapi import APIRouter, HTTPException, status,Depends
from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.services.agent_service import AgentService
from backend.app.models.response_dto import AgentResponse
from pydantic import ValidationError
from backend.dependency import get_agent_service

router = APIRouter(tags=['agent'])

@router.post("/create_agents/", status_code=status.HTTP_201_CREATED)
async def create_agent(agent_data: AgentCreateDTO,agent_service: AgentService = Depends(get_agent_service),)-> AgentResponse:
    try:
        agent = await agent_service.create_agent(agent_data)
        return agent
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
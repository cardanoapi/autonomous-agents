# agent_router.py
from typing import List

from fastapi import APIRouter, HTTPException, status,Depends
from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.services.agent_service import AgentService
from backend.app.models.response_dto import AgentResponse
from pydantic import ValidationError
from backend.dependency import get_agent_service

router = APIRouter(tags=['agent'])

@router.post("/create_agents/", status_code=status.HTTP_201_CREATED)
async def create_agent(agent_data: AgentCreateDTO, agent_service: AgentService = Depends(get_agent_service)) -> AgentResponse:
    try:
        agent = await agent_service.create_agent(agent_data)
        return agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents/", response_model=List[AgentResponse])
async def list_agents(agent_service: AgentService = Depends(get_agent_service)) -> List[AgentResponse]:
    agents = await agent_service.list_agents()
    return agents

@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str, agent_service: AgentService = Depends(get_agent_service)) -> AgentResponse:
    agent = await agent_service.get_agent(agent_id)
    return agent

@router.put("/agents/{agent_id}", status_code=status.HTTP_200_OK)
async def update_agent(agent_id: str, agent_data: AgentCreateDTO, agent_service: AgentService = Depends(get_agent_service)) -> AgentResponse:
    updated_agent = await agent_service.update_agent(agent_id, agent_data)
    return updated_agent

@router.delete("/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: str, agent_service: AgentService = Depends(get_agent_service)) -> None:
    await agent_service.delete_agent(agent_id)
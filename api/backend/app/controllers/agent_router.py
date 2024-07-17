from http import HTTPStatus
from typing import List

from classy_fastapi import Routable, get, post, put, delete
from fastapi import HTTPException, Query, Depends

from backend.app.models.agent.agent_dto import AgentCreateDTO, AgentUpdateDTO
from backend.app.models.agent.function import AgentFunction
from backend.app.services.agent_service import AgentService
from backend.app.models.agent.response_dto import AgentResponse, AgentResponseWithWalletDetails
from backend.dependency import agent_service
from backend.app.auth.cookie_dependency import verify_cookie


class AgentRouter(Routable):
    def __init__(self, agent_service: AgentService = agent_service, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.agent_service = agent_service

    @post("/agents", status_code=HTTPStatus.CREATED)
    async def create_agent(self, agent_data: AgentCreateDTO, user: dict = Depends(verify_cookie)):
        agent_data.userAddress = user.address
        agent = await self.agent_service.create_agent(agent_data)
        return agent

    @get("/agent/{agent_id}/keys", status_code=HTTPStatus.OK)
    async def get_agent_keys(self, agent_id: str):
        agent = await self.agent_service.get_agent_key(agent_id)
        return agent

    @get("/agents", response_model=List[AgentResponse])
    async def list_agents(
        self,
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, le=10),
    ):
        agents = await self.agent_service.list_agents(page, limit)
        return agents

    @get("/agent/{agent_id}", response_model=AgentResponseWithWalletDetails)
    async def get_agent(self, agent_id: str):
        agent = await self.agent_service.get_agent(agent_id)
        return agent

    @put("/agents/{agent_id}", status_code=HTTPStatus.OK)
    async def update_agent(self, agent_id: str, agent_data: AgentUpdateDTO, user: dict = Depends(verify_cookie)):
        agent_data.userAddress = user.address
        updated_agent = await self.agent_service.update_agent(agent_id, agent_data)
        return updated_agent

    @get("/agents/online", status_code=HTTPStatus.OK)
    async def get_agent_online(self):
        agents = await self.agent_service.get_active_agents_count()
        return agents

    @delete("/agents/{agent_id}", status_code=HTTPStatus.NO_CONTENT)
    async def delete_agent(self, agent_id: str, user: dict = Depends(verify_cookie)):
        return await self.agent_service.delete_agent(agent_id, user.address)

    @post("/agents/{agent_id}/trigger", status_code=HTTPStatus.OK)
    async def trigger_agent_action(self, agent_id: str, action: AgentFunction):
        await self.agent_service.trigger_agent_action(agent_id, action)

    @get("/my-agent", response_model=AgentResponseWithWalletDetails)
    async def get_my_agent(self, user: dict = Depends(verify_cookie)):
        agent = await self.agent_service.get_agent_by_user_address(user.address)
        return agent

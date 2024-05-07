# agent_service.py
from typing import List

from backend.app.models import TriggerCreateDTO, TriggerCreate_id_Dto
from backend.app.models.agent.agent_dto import AgentCreateDTO
from backend.app.models.agent.response_dto import AgentResponse
from backend.app.models import AgentCreateDTO, AgentKeyResponse, AgentResponse
from backend.app.repositories.agent_repository import AgentRepository
from backend.app.repositories.template_trigger_repository import (
    TemplateTriggerRepository,
)
from backend.app.repositories.trigger_repository import TriggerRepository
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.app.services.trigger_service import TriggerService


class AgentService:
    def __init__(
        self,
        agent_repository: AgentRepository,
        template_trigger_service: TemplateTriggerService,
        trigger_service: TriggerService,
    ):
        self.agent_repository = agent_repository
        self.template_trigger_service = template_trigger_service
        self.trigger_service = trigger_service

    async def create_agent(self, agent_data: AgentCreateDTO):
        agent = await self.agent_repository.save_agent(agent_data)
        template_trigger_data = (
            await self.template_trigger_service.get_template_trigger(agent.template_id)
        )

        trigger_data = TriggerCreate_id_Dto(
            id=template_trigger_data.id,
            type=template_trigger_data.type,
            data=template_trigger_data.data,
            action=template_trigger_data.action,
        )
        await self.trigger_service.create_trigger(agent.id, trigger_data)
        return agent

    async def get_agent_key(self, agent_id: str) -> AgentKeyResponse:
        return await self.agent_repository.retreive_agent_key(agent_id)

    async def list_agents(self) -> List[AgentResponse]:
        return await self.agent_repository.retrieve_agents()

    async def get_agent(self, agent_id: str) -> AgentResponse:
        return await self.agent_repository.retrieve_agent(agent_id)

    async def update_agent(
        self, agent_id: str, agent_data: AgentCreateDTO
    ) -> AgentResponse:
        return await self.agent_repository.modify_agent(agent_id, agent_data)

    async def delete_agent(self, agent_id: str) -> None:
        await self.agent_repository.remove_agent(agent_id)

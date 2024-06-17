# agent_service.py
from typing import List

import httpx

from backend.app.models import TriggerCreateDTO, AgentResponseWithWalletDetails
from backend.app.models import AgentCreateDTO, AgentKeyResponse, AgentResponse
from backend.app.repositories.agent_repository import AgentRepository
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.app.services.trigger_service import TriggerService
from backend.config import settings


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
        template_triggers = await self.template_trigger_service.get_template_trigger(agent.template_id)

        # Iterate over each template trigger and create a trigger for the agent
        for template_trigger_data in template_triggers:
            trigger_data = TriggerCreateDTO(
                type=template_trigger_data.type,
                data=template_trigger_data.data,
                action=template_trigger_data.action,
            )
            await self.trigger_service.create_trigger(agent.id, trigger_data)
        return agent

    async def get_agent_key(self, agent_id: str) -> AgentKeyResponse:
        return await self.agent_repository.retreive_agent_key(agent_id)

    async def list_agents(self, page: int, limit: int) -> List[AgentResponse]:
        return await self.agent_repository.retrieve_agents(page, limit)

    async def get_agent(self, agent_id: str) -> AgentResponseWithWalletDetails:
        agent = await self.agent_repository.retrieve_agent(agent_id)
        agent_with_keys = await self.agent_repository.retreive_agent_key(agent_id)
        utxo = 0
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.KUBER_URL}/utxo?address={agent_with_keys.agent_address}")
            transactions = response.json()
            for transaction in transactions:
                utxo = float(transaction.get("value", {}).get("lovelace", "0"))
        return AgentResponseWithWalletDetails(
            **agent.dict(), agent_address=agent_with_keys.agent_address, wallet_amount=utxo / (10**6)
        )

    async def update_agent(self, agent_id: str, agent_data: AgentCreateDTO) -> AgentResponse:
        return await self.agent_repository.modify_agent(agent_id, agent_data)

    async def get_active_agents_count(self):
        return await self.agent_repository.get_online_agents_count()

    async def delete_agent(self, agent_id: str) -> None:
        await self.agent_repository.remove_agent(agent_id)

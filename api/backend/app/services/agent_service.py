# agent_service.py
import json
from typing import List

import httpx

from backend.app.models import TriggerCreateDTO, AgentResponseWithWalletDetails
from backend.app.models import AgentCreateDTO, AgentKeyResponse, AgentResponse
from backend.app.models.agent.function import AgentFunction
from backend.app.repositories.agent_repository import AgentRepository
from backend.app.services.kafka_service import KafkaService
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.app.services.trigger_service import TriggerService
from backend.config import settings
from backend.app.exceptions import HTTPException


class AgentService:
    def __init__(
        self,
        agent_repository: AgentRepository,
        template_trigger_service: TemplateTriggerService,
        trigger_service: TriggerService,
        kafka_service: KafkaService,
    ):
        self.agent_repository = agent_repository
        self.template_trigger_service = template_trigger_service
        self.trigger_service = trigger_service
        self.kafka_service = kafka_service

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
        self.raise_exception_if_agent_not_found(agent)
        agent_with_keys = await self.agent_repository.retreive_agent_key(agent_id)
        utxo = 0
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.KUBER_URL}/utxo?address={agent_with_keys.agent_address}")
            transactions = response.json()
            for transaction in transactions:
                utxo = float(transaction.get("value", {}).get("lovelace", "0"))
        agent_configurations = await self.trigger_service.list_triggers_by_agent_id(agent_id)
        return AgentResponseWithWalletDetails(
            **agent.dict(),
            agent_address=agent_with_keys.agent_address,
            wallet_amount=utxo / (10**6),
            agent_configurations=agent_configurations,
        )

    async def update_agent(self, agent_id: str, agent_data: AgentCreateDTO) -> AgentResponse:
        agent = await self.agent_repository.modify_agent(agent_id, agent_data)
        self.raise_exception_if_agent_not_found(agent)
        return agent

    async def get_active_agents_count(self):
        return await self.agent_repository.get_online_agents_count()

    async def delete_agent(self, agent_id: str) -> None:
        agent = await self.agent_repository.remove_agent(agent_id)
        self.raise_exception_if_agent_not_found(agent)
        return True

    async def check_if_agent_exists(self, agent_id: str):
        agent = await self.agent_repository.retrieve_agent(agent_id)
        self.raise_exception_if_agent_not_found(agent)
        return True

    async def trigger_agent_action(self, agent_id: str, action: AgentFunction):
        await self.check_if_agent_exists(agent_id)
        await self.kafka_service.publish_message("manual_trigger_event", action.json(), key=agent_id)

    def raise_exception_if_agent_not_found(self, agent):
        if agent is None or False:
            raise HTTPException(status_code=404, content="Agent not found")

# agent_service.py
from datetime import datetime, UTC, timedelta
import json
from typing import List

import httpx

from backend.app.models import (
    TriggerCreateDTO,
    AgentResponseWithWalletDetails,
    AgentUpdateDTO,
    AgentResponseWithAgentConfigurations,
)
from backend.app.models import AgentCreateDTO, AgentKeyResponse, AgentResponse
from backend.app.models.agent.function import AgentFunction
from backend.app.repositories.agent_repository import AgentRepository
from backend.app.services.kafka_service import KafkaService
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.app.services.trigger_service import TriggerService
from backend.config import settings
from backend.app.exceptions import HTTPException
from backend.app.repositories.user_repository import UserRepository


def check_if_agent_is_online(last_active: datetime | None) -> bool:
    if last_active is None:
        return False
    threshold_time = timedelta(seconds=5)
    time_diff = datetime.now(UTC) - last_active
    if time_diff <= threshold_time:
        return True
    return False


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
        self.user_reposiotry = UserRepository()

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
        agents = await self.agent_repository.retrieve_agents(page, limit)
        updated_agents = []
        for agent in agents:
            is_online = check_if_agent_is_online(agent.last_active)
            agent_triggers_number = len(await self.trigger_service.list_triggers_by_agent_id(agent.id))
            updated_agents.append(
                AgentResponse(**agent.dict(), total_functions=agent_triggers_number, is_active=is_online)
            )
        return updated_agents

    async def get_agent(self, agent_id: str) -> AgentResponseWithWalletDetails:
        agent = await self.agent_repository.retrieve_agent(agent_id)
        self.raise_exception_if_agent_not_found(agent)
        agent.is_active = check_if_agent_is_online(agent.last_active)
        response = await self.return_agent_with_wallet_details(agent)
        return response

    async def update_agent(
        self, agent_id: str, agent_data: AgentUpdateDTO, userAddress: str
    ) -> AgentResponseWithAgentConfigurations:

        existing_agent = await self.agent_repository.retrieve_agent(agent_id)
        self.raise_exception_if_agent_not_found(existing_agent)
        await self.is_authorized(userAddress, existing_agent)

        updated_triggers = await self.trigger_service.update_configurations_for_agent(
            agent_id, agent_data.agent_configurations
        )

        existing_agent = await self.agent_repository.modify_agent(agent_id, agent_data)
        self.raise_exception_if_agent_not_found(existing_agent)
        return AgentResponseWithAgentConfigurations(**existing_agent.dict(), agent_configurations=updated_triggers)

    async def get_active_agents_count(self):
        return await self.agent_repository.get_online_agents_count()

    async def delete_agent(self, agent_id: str, user_address: str) -> str:

        existing_agent = await self.agent_repository.retrieve_agent(agent_id)
        self.raise_exception_if_agent_not_found(existing_agent)
        await self.is_superadmin(user_address)

        await self.agent_repository.remove_agent(agent_id)

        await self.kafka_service.publish_message(
            "Agent_Trigger",
            json.dumps({"method": "Agent_Deletion", "parameters": []}),
            agent_id,
        )
        return agent_id

    async def check_if_agent_exists(self, agent_id: str):
        agent = await self.agent_repository.retrieve_agent(agent_id)
        self.raise_exception_if_agent_not_found(agent)
        return True

    async def trigger_agent_action(self, agent_id: str, action: AgentFunction):
        await self.check_if_agent_exists(agent_id)
        message_in_rpc_format = json.dumps({"method": action.function_name, "parameters": action.dict()["parameters"]})
        await self.kafka_service.publish_message("Agent_Trigger", message_in_rpc_format, key=agent_id)

    def raise_exception_if_agent_not_found(self, agent):
        if agent is None or False:
            raise HTTPException(status_code=404, content="Agent not found")

    async def get_agent_by_user_address(self, user_address: str) -> AgentResponseWithWalletDetails:
        agent = await self.agent_repository.retrieve_agent_by_user_address(user_address=user_address)
        self.raise_exception_if_agent_not_found(agent)
        agent.is_active = check_if_agent_is_online(agent.last_active)
        response = await self.return_agent_with_wallet_details(agent)
        return response

    async def is_authorized(self, userAddress: str, existing_agent: AgentResponse):
        # Checks if agent belongs to user or user is super admin
        user_is_super_admin = await self.user_reposiotry.is_super_admin(userAddress)
        if existing_agent.userAddress != userAddress and user_is_super_admin == False:
            raise HTTPException(status_code=403, content="Forbidden Request")

    async def is_superadmin(self, userAddress: str):
        user_is_super_admin = await self.user_reposiotry.is_super_admin(userAddress)
        if user_is_super_admin == False:
            raise HTTPException(status_code=403, content="Forbidden Request")

    async def return_agent_with_wallet_details(self, agent: AgentResponse):
        agent_with_keys = await self.agent_repository.retreive_agent_key(agent.id)
        utxo = 0
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.KUBER_URL}/utxo?address={agent_with_keys.agent_address}")
            transactions = response.json()
            if isinstance(transactions, list):
                for transaction in transactions:
                    utxo = utxo + float(transaction.get("value", {}).get("lovelace", "0"))
        agent_configurations = await self.trigger_service.list_triggers_by_agent_id(agent.id)
        return AgentResponseWithWalletDetails(
            **agent.dict(),
            agent_address=agent_with_keys.agent_address,
            wallet_amount=utxo / (10**6),
            agent_configurations=agent_configurations,
        )

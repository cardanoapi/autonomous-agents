# agent_service.py
import asyncio
import json
from datetime import datetime, UTC, timedelta
from typing import List, Dict

import aiohttp
from aiohttp import ClientSession

from backend.app.exceptions import HTTPException
from backend.app.models import AgentCreateDTO, AgentResponse, Delegation
from backend.app.models import (
    TriggerCreateDTO,
    AgentResponseWithWalletDetails,
    AgentUpdateDTO,
    AgentResponseWithAgentConfigurations,
)
from backend.app.models.agent.agent_instance_wallet import AgentInstanceWallet
from backend.app.models.agent.function import AgentFunction
from backend.app.repositories.agent_repository import AgentRepository
from backend.app.repositories.user_repository import UserRepository
from backend.app.services.agent_instance_wallet_service import AgentInstanceWalletService
from backend.app.services.kafka_service import KafkaService
from backend.app.services.template_service import TemplateService
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.app.services.trigger_service import TriggerService
from backend.config.api_settings import api_settings


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
        agent_instance_wallet_service: AgentInstanceWalletService,
        template_service: TemplateService,
    ):
        self.agent_repository = agent_repository
        self.template_trigger_service = template_trigger_service
        self.trigger_service = trigger_service
        self.kafka_service = kafka_service
        self.user_repository = UserRepository()
        self.agent_instance_wallet_service = agent_instance_wallet_service
        self.template_service = template_service

    async def create_agent(self, agent_data: AgentCreateDTO):
        agent = await self.agent_repository.save_agent(agent_data)
        await self.agent_instance_wallet_service.create_wallet(agent)
        if agent_data.template_id:
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

    async def get_agent_key(self, agent_id: str):
        # return await self.agent_instance_wallet_service.get_wallets(agent_id)
        return await self.agent_repository.retreive_agent_key(agent_id)

    async def list_agents(self, page: int, size: int, search: str | None) -> List[AgentResponse]:
        skip = (page - 1) * size
        filters = {"deleted_at": None}
        if search:
            filters["name"] = {"contains": search, "mode": "insensitive"}
        agents = await self.agent_repository.db.prisma.agent.find_many(
            include={"template": True, "triggers": True}, where=filters, skip=skip, take=size
        )
        updated_agents = []
        for agent in agents:
            is_online = check_if_agent_is_online(agent.last_active)
            updated_agents.append(
                AgentResponse(
                    **agent.dict(),
                    total_functions=len(agent.triggers),
                    is_active=is_online,
                    template_name=agent.template.name if agent.template else "",
                )
            )
        return updated_agents

    async def get_agent(self, agent_id: str) -> AgentResponseWithWalletDetails:
        agent = await self.agent_repository.retrieve_agent(agent_id)
        self.raise_exception_if_agent_not_found(agent)
        agent.is_active = check_if_agent_is_online(agent.last_active)
        response = await self.return_agent_with_wallet_details(agent)
        return response

    async def fetch_wallet_details_and_seed_drep_registration(self, agent: AgentResponse, session: ClientSession):
        wallets = await self.agent_instance_wallet_service.get_wallets(agent.id)
        if not len(wallets):
            await self.agent_instance_wallet_service.create_wallet(agent)
        wallets = await self.agent_instance_wallet_service.get_wallets(agent.id)
        wallet = wallets[0]
        drep = await self.fetch_drep_details(wallet.stake_key_hash, session)
        drep_registered = drep.get("is_drep_registered", False)
        if drep_registered:
            await self.agent_repository.update_agent_drep_status(agent.id, drep_registered)

    async def seed_drep_registration_column(self):
        agents = await self.agent_repository.retrieve_all_agents()
        async with aiohttp.ClientSession() as session:
            async with asyncio.TaskGroup() as group:
                for agent in agents:
                    group.create_task(self.fetch_wallet_details_and_seed_drep_registration(agent, session))
        return "Successful"

    async def update_agent(
        self, agent_id: str, agent_data: AgentUpdateDTO, userAddress: str
    ) -> AgentResponseWithAgentConfigurations:

        existing_agent = await self.agent_repository.retrieve_agent(agent_id)
        self.raise_exception_if_agent_not_found(existing_agent)
        await self.is_authorized(userAddress, existing_agent)

        updated_triggers = await self.trigger_service.update_configurations_for_agent(
            agent_id, agent_data.agent_configurations
        )
        if existing_agent.instance < agent_data.instance:
            await self.agent_instance_wallet_service.update_wallet(
                existing_agent, agent_data.instance - existing_agent.instance
            )
        existing_agent = await self.agent_repository.modify_agent(agent_id, agent_data)
        self.raise_exception_if_agent_not_found(existing_agent)
        await self.kafka_service.publish_message(
            api_settings.KAFKA_PREFIX + "trigger_config_updates", "config_updated", key=agent_id
        )
        return AgentResponseWithAgentConfigurations(**existing_agent.dict(), agent_configurations=updated_triggers)

    async def get_active_agents_count(self):
        return await self.agent_repository.get_online_agents_count()

    async def delete_agent(self, agent_id: str, user_address: str) -> str:

        existing_agent = await self.agent_repository.retrieve_agent(agent_id)
        self.raise_exception_if_agent_not_found(existing_agent)
        await self.is_superadmin(user_address)

        await self.agent_repository.remove_agent(agent_id)
        await self.agent_instance_wallet_service.delete_wallet(agent_id)

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
        await self.kafka_service.publish_message(
            api_settings.KAFKA_PREFIX + "Agent_Trigger", message_in_rpc_format, key=agent_id
        )

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
        user_is_super_admin = await self.user_repository.is_super_admin(userAddress)
        if existing_agent.userAddress != userAddress and user_is_super_admin == False:
            raise HTTPException(status_code=403, content="Forbidden Request")

    async def is_superadmin(self, userAddress: str):
        user_is_super_admin = await self.user_repository.is_super_admin(userAddress)
        if user_is_super_admin == False:
            raise HTTPException(status_code=403, content="Forbidden Request")

    async def fetch_data(self, url, session: ClientSession):
        async with session.get(url) as response:
            try:
                return await response.json()
            except:
                raise HTTPException(status_code=400, content="Error fetching agent Drep details")

    async def fetch_balance(self, stake_address: str, session: ClientSession):
        async with session.get(f"{api_settings.DB_SYNC_API}/address/balance?address={stake_address}") as response:
            try:
                return await response.json()
            except:
                raise HTTPException(status_code=400, content="Error fetching agent wallet balance")

    async def fetch_drep_details(self, drep_id: str, session: ClientSession) -> Dict[str, float | bool]:
        async with session.get(f"{api_settings.DB_SYNC_API}/drep/{drep_id}") as response:
            try:
                res = await response.json()
                voting_power = res.get("votingPower") / (10**6) if res.get("votingPower") else 0
                is_drep_registered = res.get("isRegisteredAsDRep", False)
                return {"voting_power": voting_power, "is_drep_registered": is_drep_registered}
            except:
                raise HTTPException(status_code=400, content="Error fetching agent Drep details")

    async def fetch_stake_address_details(self, stake_address: str, session: ClientSession):
        async with session.get(f"{api_settings.DB_SYNC_API}/stake-address?address={stake_address}") as response:
            try:
                is_stake_registered = False
                res = await response.json()
                registration = res.get("registration", None)
                de_registration = res.get("deRegistration", None)
                if registration and not de_registration:
                    is_stake_registered = True
                elif registration and de_registration:
                    is_stake_registered = registration.get("block_no", 0) > de_registration.get("block_no", 0)
                else:
                    is_stake_registered = False
                last_registered = res.get("registration", {}).get("time", None) if res.get("registration", {}) else None
                return {"last_registered": last_registered, "is_stake_registered": is_stake_registered}
            except:
                raise HTTPException(status_code=400, content="Error fetching agent Drep details")

    async def fetch_delegation_details(self, stake_address: str, session: ClientSession):
        async with session.get(f"{api_settings.DB_SYNC_API}/delegation?address={stake_address}") as response:
            try:
                res = await response.json()
                drep_id = res.get("drep", {}).get("drep_id") if res.get("drep") else None
                pool_id = res.get("pool", {}).get("pool_id") if res.get("pool") else None
                return Delegation(pool_id=pool_id, drep_id=drep_id)
            except:
                raise HTTPException(status_code=400, content="Error fetching agent Drep details")

    async def return_agent_with_wallet_details(self, agent: AgentResponse):
        wallets = await self.agent_instance_wallet_service.get_wallets(agent_id=agent.id)
        if len(wallets):
            wallet = wallets[0]
        else:
            agent_keys = await self.agent_repository.retreive_agent_key(agent.id)
            wallet = AgentInstanceWallet(
                agent_id=agent.id,
                address=agent_keys.agent_address,
                payment_key_hash=agent_keys.payment_verification_key_hash,
                stake_key_hash=agent_keys.stake_verification_key_hash,
                instance_index=0,
            )
        async with aiohttp.ClientSession() as session:
            async with asyncio.TaskGroup() as group:
                agent_configurations = group.create_task(self.trigger_service.list_triggers_by_agent_id(agent.id))
                wallet_balance = group.create_task(self.fetch_balance(convert_stake_key_hash_to_address(wallet.stake_key_hash), session))
                drep_details = group.create_task(self.fetch_drep_details(convert_stake_key_hash_to_address(wallet.stake_key_hash), session))
                delegation_details = group.create_task(self.fetch_delegation_details(convert_stake_key_hash_to_address(wallet.stake_key_hash), session))
                stake_address_details = group.create_task(
                    self.fetch_stake_address_details(wallet.stake_key_hash, session)
                )

        return AgentResponseWithWalletDetails(
            **agent.dict(),
            agent_address=wallet.address,
            wallet_amount=wallet_balance.result() / (10**6),
            agent_configurations=agent_configurations.result(),
            voting_power=drep_details.result().get("voting_power"),
            delegation=delegation_details.result(),
            drep_id=wallet.stake_key_hash,
            is_stake_registered=stake_address_details.result().get("is_stake_registered"),
            stake_last_registered=stake_address_details.result().get("last_registered"),
        )

    
def convert_stake_key_hash_to_address(stake_key_hash):
    if stake_key_hash.startswith('e0') or stake_key_hash.startswith('e1'):
        return stake_key_hash
    else:
        if api_settings.APP_ENV == "mainnet":
            return 'e1' + stake_key_hash
        else:
            return 'e0' + stake_key_hash
from datetime import datetime, timezone

from backend.app.models.agent.agent_dto import AgentCreateDTO
from backend.app.models.user.user_dto import UserCreateDto
from backend.app.repositories.agent_instance_wallet_repository import AgentInstanceWalletRepository
from backend.app.repositories.agent_repository import AgentRepository
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.services.agent_instance_wallet_service import AgentInstanceWalletService
from backend.config.database import prisma_connection


class UserRepository:
    def __init__(self, db_connection=None) -> None:
        self.db = db_connection or prisma_connection
        self.agent_repository = AgentRepository()
        self.template_repository = TemplateRepository()
        self.agent_instance_wallet_service = AgentInstanceWalletService(AgentInstanceWalletRepository())

    async def create_user(self, user_data: UserCreateDto):
        user = await self.get_user_by_address(user_data.address)
        if user:
            await self.create_empty_agent_for_user_if_not_exists(user_data.address)
            return user

        user = await self._create_new_user(user_data)
        await self.create_empty_agent_for_user(user_data.address)

        return user

    async def get_user_by_address(self, address: str):
        return await self.db.prisma.user.find_unique(where={"address": address})

    async def _create_new_user(self, user_data: UserCreateDto):
        user_data_dict = {
            "address": user_data.address,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "isSuperUser": user_data.isSuperUser,
        }
        return await self.db.prisma.user.create(data=user_data_dict)

    async def is_super_admin(self, user_address: str) -> bool:
        user = await self.get_user_by_address(user_address)
        return user.isSuperUser if user else False

    async def create_empty_agent_for_user(self, user_address: str):
        empty_agent_data = AgentCreateDTO(userAddress=user_address, name="Empty Agent", template_id=None, instance=1)
        agent = await self.agent_repository.save_agent(empty_agent_data)
        await self.agent_instance_wallet_service.create_wallet(agent)

    async def create_empty_agent_for_user_if_not_exists(self, user_address: str):
        agent = await self.agent_repository.retrieve_agent_by_user_address(user_address)
        if not agent:
            await self.create_empty_agent_for_user(user_address)

from backend.config.database import prisma_connection
from datetime import datetime, timezone
from backend.app.utils.extras import create_empty_agent_for_user, create_empty_agent_for_user_if_does_not_exist
from backend.app.models.user.user_dto import UserCreateDto


class UserRepository:
    def __init__(self, db_connection=None) -> None:
        self.db = db_connection or prisma_connection

    async def create_user(self, UserData: UserCreateDto):
        # If user with the address already exists return the user
        user = await self.db.prisma.user.find_unique(where={"address": UserData.address})
        if user:
            await create_empty_agent_for_user_if_does_not_exist(UserData.address)
            return user

        user_data_dict = {
            "address": UserData.address,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "isSuperUser": UserData.isSuperUser,
        }
        user = await self.db.prisma.user.create(data=user_data_dict)

        # When creating new user , create an agent with empty behaviour for the user.
        await create_empty_agent_for_user(UserData.address)

        return user

    async def is_super_admin(self, user_address: str) -> bool:
        user = await self.db.prisma.user.find_unique(where={"address": user_address})
        if user:
            return user.isSuperUser
        return False

from backend.config.database import prisma_connection
from datetime import datetime, timezone
from backend.app.utils.extras import create_empty_agent_for_user, create_empty_agent_for_user_if_does_not_exist


class UserRepository:
    def __init__(self, db_connection=None) -> None:
        self.db = db_connection or prisma_connection

    async def create_user(self, user_address: str):
        # If user with the address already exists return the user
        user = await self.db.prisma.user.find_unique(where={"address": user_address})
        if user:
            await create_empty_agent_for_user_if_does_not_exist(user_address)
            return user

        user_data_dict = {
            "address": user_address,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        user = await self.db.prisma.user.create(data=user_data_dict)

        # When creating new user , create an agent with empty behaviour for the user.
        await create_empty_agent_for_user(user_address)

        return user

    async def is_super_admin(self, user_address: str) -> bool:
        user = await self.db.prisma.user.find_unique(where={"address": user_address})
        if user:
            return user.isSuperUser
        return False

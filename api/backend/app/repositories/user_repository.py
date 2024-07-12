from backend.config.database import prisma_connection
from datetime import datetime, timezone


class UserRepository:
    def __init__(self, db_connection=None) -> None:
        self.db = db_connection or prisma_connection

    async def save_user(self, user_address: str):
        user = await self.db.prisma.user.find_unique(where={"address": user_address})
        if user:
            return user
        user_data_dict = {
            "address": user_address,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        user = await self.db.prisma.user.create(data=user_data_dict)
        return user

from backend.app.repositories.user_repository import UserRepository


class UserService:
    def __init__(self, user_repository=UserRepository) -> None:
        self.user_repository = user_repository()

    async def create_user(self, user_address: str):
        return await self.user_repository.save_user(user_address)

from backend.app.repositories.user_repository import UserRepository
from backend.app.models.user.user_dto import UserCreateDto


class UserService:
    def __init__(self, user_repository=UserRepository) -> None:
        self.user_repository = user_repository()

    async def create_user(self, UserData: UserCreateDto):
        return await self.user_repository.create_user(UserData)

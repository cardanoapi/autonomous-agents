from backend.app.repositories.function_repository import AgentFunctionDetailRepository


class AgentFunctionDetailService:
    def __init__(self, function_repo: AgentFunctionDetailRepository):
        self.function_repo = function_repo

    async def get_all_function_details(self):
        return await self.function_repo.get_agent_all_functions_details()

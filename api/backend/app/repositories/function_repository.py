from backend.config.database import prisma_connection


class AgentFunctionDetailRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def get_agent_all_functions_details(self):
        return await self.db.prisma.functiondetail.find_many()

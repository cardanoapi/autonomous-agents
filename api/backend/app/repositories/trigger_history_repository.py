from backend.config.database import prisma_connection
from fastapi_pagination import paginate


class TriggerHistoryRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def get_all_triggers_history(
        self, agent_id, function_name, status, success , enable_pagination=True
    ):
        query = {}
        if agent_id is not None:
            query["agentId"] = agent_id
        if function_name is not None:
            query["functionName"] = {"in" : function_name}
        if status is not None:
            query["status"] = status
        if success is not None:
            query["success"] = success
        results = await self.db.prisma.triggerhistory.find_many(where=query, order=[{"timestamp": "desc"}])
        return paginate(results) if enable_pagination else results

    async def get_trigger_history_by_query(self, query: dict):
        results = await self.db.prisma.triggerhistory.find_many(where=query)
        return results

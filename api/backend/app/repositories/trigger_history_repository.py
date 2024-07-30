from backend.config.database import prisma_connection
from fastapi_pagination import Page, paginate
from backend.app.models.trigger_history.trigger_history_dto import TriggerHistoryDto


class TriggerHistoryRepository:
    def __init__(self, db_connection=None):
        self.db = db_connection or prisma_connection

    async def get_all_triggers_history(self, agent_id, function_name, status, success, page, size):
        query = {}
        if agent_id is not None:
            query["agentId"] = agent_id
        if function_name is not None:
            query["functionName"] = {"in": function_name}
        if status is not None:
            query["status"] = status
        if success is not None:
            query["success"] = success

        results = await self.db.prisma.triggerhistory.find_many(
            skip=(page - 1) * size, take=size, where=query, order=[{"timestamp": "desc"}]
        )
        total = await self.db.prisma.triggerhistory.count(where=query)

        formated_results: Page[TriggerHistoryDto] = {
            "items": results,
            "total": total,
            "page": page,
            "size": size,
            "pages": total / size,
        }
        return formated_results

    async def get_trigger_history_by_query(self, query: dict):
        results = await self.db.prisma.triggerhistory.find_many(where=query)
        return results

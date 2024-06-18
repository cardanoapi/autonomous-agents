from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

from fastapi_pagination import Page

from backend.app.exceptions import HTTPException
from backend.app.models.trigger_history.trigger_history_dto import TriggerHistoryDto
from backend.app.repositories.trigger_history_repository import TriggerHistoryRepository
from backend.config.database import prisma_connection


class TriggerHistoryService:
    def __init__(self, trigger_history_repo: TriggerHistoryRepository):
        self.trigger_history_repo = trigger_history_repo
        self.db = prisma_connection

    async def get_all_trigger_history(self, agent_id, function_name) -> Page[TriggerHistoryDto]:
        return await self.trigger_history_repo.get_all_triggers_history(agent_id, function_name)

    async def count_number_of_executed_transactions(self, success: bool, agent_id: Optional[str] = None):
        end_time = datetime.now()
        start_time = end_time - timedelta(days=1)
        query = {
            "timestamp": {"gte": start_time, "lte": end_time},
            "success": success,
        }

        if agent_id is not None:
            agent = await self.db.prisma.agent.find_first(where={"id": agent_id})
            if agent is None or agent.last_active is None:
                raise HTTPException(status_code=400, content=f"Agent with {agent_id} does not exist")
            else:
                query["agentId"] = agent_id

        # Initialize a dictionary to store transaction counts for each minute
        transaction_counts = defaultdict(int)

        # Query transactions within the specified time range
        transactions = await self.trigger_history_repo.get_trigger_history_by_query(query)

        # Count transactions for each minute
        for transaction in transactions:
            minute_str = transaction.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            transaction_counts[minute_str] += 1

        # Fill in minutes with zero transactions
        current_minute = start_time
        while current_minute <= end_time:
            minute_str = current_minute.strftime("%Y-%m-%d %H:%M:%S")
            if minute_str not in transaction_counts:
                transaction_counts[minute_str] = 0
            current_minute += timedelta(minutes=1)

        # Sort the dictionary by keys
        sorted_transaction_counts = dict(sorted(transaction_counts.items()))

        return sorted_transaction_counts

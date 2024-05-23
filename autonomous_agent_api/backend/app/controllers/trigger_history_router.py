from datetime import datetime, timedelta
from http import HTTPStatus
from http.client import HTTPException
from typing import List

from classy_fastapi import Routable, post, get, put, delete
from fastapi import Query

from backend.config.database import prisma_connection
from backend.dependency import get_template_service


class TriggerHistory(Routable):
    def __init__(self, db_connection=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = db_connection or prisma_connection

    @get("/trigger-history", response_model=List[dict])
    async def get_all_trigger_history(self, page: int = Query(default=1, ge=1), limit: int = Query(default=50, le=50)):
        skip = (page - 1) * limit
        results = await self.db.prisma.triggerhistory.find_many(skip=skip, take=limit)
        return results

    @get("/trigger-history/{agent_id}/agent", response_model=List[dict])
    async def get_trigger_history_by_agent(
        self,
        agent_id: str,
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=50, le=50),
    ):
        skip = (page - 1) * limit
        results = await self.db.prisma.triggerhistory.find_many(
            where={"agentId": agent_id},
            skip=skip,
            take=limit,
        )
        return results

    @get("/trigger-history/{function_name}/function", response_model=List[dict])
    async def get_trigger_history_by_function(
        self,
        function_name: str,
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=50, le=50),
    ):
        skip = (page - 1) * limit
        results = await self.db.prisma.triggerhistory.find_many(
            where={"functionName": function_name}, skip=skip, take=limit
        )
        return results

    @get("/function-details", response_model=List[dict])
    async def get_all_function_details(self):
        results = await self.db.prisma.functiondetail.find_many()
        return results

    @get("/transaction-counts/", response_model=dict)
    async def get_transaction_counts_success(self, success: bool = Query(True)):
        # Calculate the start and end timestamps for the last 24 hours
        end_time = datetime.now()
        start_time = end_time - timedelta(days=1)

        # Query to group transactions by minute and count them
        transaction_counts = {}

        # Execute the query and fetch all results
        transactions = await self.db.prisma.triggerhistory.find_many(
            where={
                "timestamp": {"gte": start_time, "lte": end_time},
                "success": success,
            }
        )

        # Count transactions for each minute
        for transaction in transactions:
            minute_str = transaction.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            if minute_str in transaction_counts:
                transaction_counts[minute_str] += 1
            else:
                transaction_counts[minute_str] = 1

        return transaction_counts

    @get("/transaction-counts/{agent-id}/agent", response_model=dict)
    async def get_transaction_counts_success_agent_id(self, agent_id: str, success: bool = Query(True)):
        # Calculate the start and end timestamps for the last 24 hours
        end_time = datetime.now()
        start_time = end_time - timedelta(days=1)

        # Query to group transactions by minute and count them
        transaction_counts = {}

        # Execute the query and fetch all results
        transactions = await self.db.prisma.triggerhistory.find_many(
            where={
                "timestamp": {"gte": start_time, "lte": end_time},
                "agentId": agent_id,
                "success": success,
            }
        )
        # Count transactions for each minute
        for transaction in transactions:
            minute_str = transaction.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            if minute_str in transaction_counts:
                transaction_counts[minute_str] += 1
            else:
                transaction_counts[minute_str] = 1

        return transaction_counts

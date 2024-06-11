from collections import defaultdict
from datetime import datetime, timedelta
from http import HTTPStatus
from http.client import HTTPException
from typing import List

from classy_fastapi import Routable, post, get, put, delete
from fastapi import Query

from backend.config.database import prisma_connection


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

    @get("/transaction-counts", response_model=dict)
    async def get_transaction_counts_success(self, success: bool = Query(True)):
        # Calculate the start and end timestamps for the last 24 hours
        end_time = datetime.now()
        start_time = end_time - timedelta(days=1)

        # Initialize a dictionary to store transaction counts for each minute
        transaction_counts = defaultdict(int)

        # Query transactions within the specified time range
        transactions = await self.db.prisma.triggerhistory.find_many(
            where={
                "timestamp": {"gte": start_time, "lte": end_time},
                "success": success,
            }
        )

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

    @get("/transaction-counts/{agent_id}/agent", response_model=dict)
    async def get_transaction_counts_success_agent_id(self, agent_id: str, success: bool = Query(True)):
        # Calculate the start and end timestamps for the last 24 hours
        end_time = datetime.now()
        start_time = end_time - timedelta(days=1)

        # extracting agent's details
        agent = await self.db.prisma.agent.find_first(where={"id": agent_id})
        print(agent)

        if agent is None or agent.last_active is None:
            # If agent does not exist or last_active is null, return an empty dictionary
            return {}
        # Initialize a dictionary to store transaction counts for each minute
        transaction_counts = defaultdict(int)

        # Query transactions within the specified time range and agent ID
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

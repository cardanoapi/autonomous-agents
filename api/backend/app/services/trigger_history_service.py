from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi_pagination import Page

from backend.app.exceptions import HTTPException
from backend.app.models.trigger_history.trigger_history_dto import TriggerHistoryDto
from backend.app.repositories.trigger_history_repository import TriggerHistoryRepository
from backend.config.database import prisma_connection


class TriggerClassifier:
    # Custom Data structure for Accumulating Transaction Count using TimeStamp.
    # The append method offsets the index for data acuumulation accordingly.
    def __init__(self, classifier_type) -> None:
        self.classifier_type = classifier_type
        classifier_types = ["LASTHOUR", "LAST24HOUR", "LASTWEEK"]
        assert self.classifier_type in classifier_types

        max_range = None
        if classifier_type == "LASTHOUR":
            max_range = 60
        if classifier_type == "LAST24HOUR":
            max_range = 24
        if classifier_type == "LASTWEEK":
            max_range = 7

        self.accumulator = [0 for i in range(0, max_range)]

    
    def append(self, item):
        today = datetime.now(timezone.utc)
        if self.classifier_type == "LASTHOUR":
            self.accumulator[(today.minute - item.minute)%60] += 1
        elif self.classifier_type == "LAST24HOUR":
            self.accumulator[(today.hour - item.hour)%24] += 1
        elif self.classifier_type == 'LASTWEEK':
            self.accumulator[(today.day - item.day)%7] += 1


class TriggerHistoryService:
    def __init__(self, trigger_history_repo: TriggerHistoryRepository):
        self.trigger_history_repo = trigger_history_repo
        self.db = prisma_connection

    async def get_all_trigger_history(
        self, agent_id, function_name, status, success, functions_list
    ) -> Page[TriggerHistoryDto]:
        return await self.trigger_history_repo.get_all_triggers_history(
            agent_id, function_name, status, success, functions_list
        )

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

    async def calculate_trigger_metric(self, function_name: str):

        successfull_triggers = await self.trigger_history_repo.get_all_triggers_history(
            agent_id=None,
            function_name=function_name,
            status=True,
            success=True,
            functions_list=None,
            enable_pagination=False,
        )
        unsuccessfull_triggers = await self.trigger_history_repo.get_all_triggers_history(
            agent_id=None,
            function_name=function_name,
            status=True,
            success=False,
            functions_list=None,
            enable_pagination=False,
        )
        skipeed_triggers = await self.trigger_history_repo.get_all_triggers_history(
            agent_id=None,
            function_name=function_name,
            status=False,
            success=False,
            functions_list=None,
            enable_pagination=False,
        )

        today = datetime.now(timezone.utc)
        last_hour_successful_triggers = TriggerClassifier("LASTHOUR")
        last_24hour_successful_triggers = TriggerClassifier("LAST24HOUR")
        last_week_successful_triggers = TriggerClassifier("LASTWEEK")

        for item in successfull_triggers:
            time_diff = today - item.timestamp
            #Check the Time difference / Time passed between today and log timestamp.
            if time_diff.days < 7:
                last_week_successful_triggers.append(item.timestamp)
                if time_diff.days < 1: 
                    last_24hour_successful_triggers.append(item.timestamp)
                    if (time_diff.seconds/60) < 60: 
                         last_hour_successful_triggers.append(item.timestamp)

        response = {
            "function_name": function_name,
            "successfull_triggers": len(successfull_triggers),
            "unsuccessfull_triggers": len(unsuccessfull_triggers),
            "skipped_triggers": len(skipeed_triggers),
            "last_hour_successfull_triggers": last_hour_successful_triggers.accumulator,
            "last_24hour_successfull_triggers": last_24hour_successful_triggers.accumulator,
            "last_week_successfull_triggers" : last_week_successful_triggers.accumulator
        }
        return response

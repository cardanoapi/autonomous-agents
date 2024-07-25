from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi_pagination import Page

from backend.app.exceptions import HTTPException
from backend.app.models.trigger_history.trigger_history_dto import TriggerHistoryDto
from backend.app.repositories.trigger_history_repository import TriggerHistoryRepository
from backend.config.database import prisma_connection
from backend.app.utils.extras import calculate_change_rate


from datetime import datetime, timezone


class TriggerClassifier:
    # Custom Data structure for Accumulating Transaction Count using TimeStamp.
    # The append method offsets the index for data accumulation accordingly.
    def __init__(self, classifier_type) -> None:
        self.classifier_type = classifier_type
        classifier_types = ["LASTHOUR", "LAST24HOUR", "LASTWEEK"]
        assert self.classifier_type in classifier_types

        max_range = None
        if classifier_type == "LASTHOUR":
            max_range = 60
        elif classifier_type == "LAST24HOUR":
            max_range = 24
        elif classifier_type == "LASTWEEK":
            max_range = 7

        self.accumulator = [{"count": 0, "values": {}} for _ in range(max_range)]

    def append(self, timestamp, itemName):
        today = datetime.now(timezone.utc)
        time_diff = today - timestamp

        if self.classifier_type == "LASTHOUR":
            index = int(time_diff.total_seconds() / 60) % 60
        elif self.classifier_type == "LAST24HOUR":
            index = int(time_diff.total_seconds() / 3600) % 24
        elif self.classifier_type == "LASTWEEK":
            index = time_diff.days % 7

        self.accumulator[index]["count"] += 1
        if itemName in self.accumulator[index]["values"]:
            self.accumulator[index]["values"][itemName] += 1
        else:
            self.accumulator[index]["values"][itemName] = 1


class TriggerHistoryService:
    def __init__(self, trigger_history_repo: TriggerHistoryRepository):
        self.trigger_history_repo = trigger_history_repo
        self.db = prisma_connection

    async def get_all_trigger_history(
        self,
        agent_id,
        function_name,
        status,
        success,
    ) -> Page[TriggerHistoryDto]:
        return await self.trigger_history_repo.get_all_triggers_history(agent_id, function_name, status, success)

    async def count_number_of_executed_transactions(self, success: bool, agent_id: Optional[str] = None):
        end_time = datetime.now()
        start_time = end_time - timedelta(days=1)
        query = {
            "timestamp": {"gte": start_time, "lte": end_time},
            "success": success,
        }

        if agent_id is not None:
            agent = await self.db.prisma.agent.find_first(where={"id": agent_id})
            if agent is None:
                raise HTTPException(status_code=404, content=f"Agent with {agent_id} does not exist")
            elif agent.last_active is None:
                raise HTTPException(status_code=404, content=f"Trigger History for agent {agent_id} does not exist")
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

    async def calculate_trigger_metric(self, function_name: list[str], agent_id: str):

        successfull_triggers = await self.trigger_history_repo.get_all_triggers_history(
            agent_id=agent_id,
            function_name=function_name,
            status=True,
            success=True,
            enable_pagination=False,
        )
        unsuccessfull_triggers = await self.trigger_history_repo.get_all_triggers_history(
            agent_id=agent_id,
            function_name=function_name,
            status=True,
            success=False,
            enable_pagination=False,
        )
        skipeed_triggers = await self.trigger_history_repo.get_all_triggers_history(
            agent_id=agent_id,
            function_name=function_name,
            status=False,
            success=False,
            enable_pagination=False,
        )

        today = datetime.now(timezone.utc)
        last_hour_successful_triggers = TriggerClassifier("LASTHOUR")
        last_24hour_successful_triggers = TriggerClassifier("LAST24HOUR")
        last_week_successful_triggers = TriggerClassifier("LASTWEEK")

        last_day_transactions = 0
        today_transactions = 0
        successfull_triggers_dict = {}

        for trigger in successfull_triggers:
            time_diff = today - trigger.timestamp

            # Check the Time difference / Time passed between today and log timestamp.
            if time_diff.days < 7:
                last_week_successful_triggers.append(trigger.timestamp, trigger.functionName)
                if time_diff.days < 1:
                    last_24hour_successful_triggers.append(trigger.timestamp, trigger.functionName)
                    if (time_diff.seconds / 60) < 60:
                        last_hour_successful_triggers.append(trigger.timestamp, trigger.functionName)

            # For calculating fluctuation rate
            if time_diff.days < 3 and time_diff.days >= 1:
                last_day_transactions += 1
            elif time_diff.days < 1:
                today_transactions += 1

        # for classifying succcesfull triggers
        for trigger in successfull_triggers:
            if trigger.functionName in successfull_triggers_dict:
                successfull_triggers_dict[trigger.functionName] += 1
            else:
                successfull_triggers_dict[trigger.functionName] = 1

        response = {
            "function_name": function_name,
            "no_of_successful_triggers": len(successfull_triggers),
            "no_of_unsuccessful_triggers": len(unsuccessfull_triggers),
            "no_of_skipped_triggers": len(skipeed_triggers),
            "last_hour_successful_triggers": last_hour_successful_triggers.accumulator,
            "last_24hour_successful_triggers": last_24hour_successful_triggers.accumulator,
            "last_week_successful_triggers": last_week_successful_triggers.accumulator,
            "today_fluctuation_rate": calculate_change_rate(last_day_transactions, today_transactions),
        }
        return response

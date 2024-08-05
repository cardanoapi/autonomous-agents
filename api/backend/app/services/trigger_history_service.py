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
        self, agent_id, function_name, status, success, page, size
    ) -> Page[TriggerHistoryDto]:
        return await self.trigger_history_repo.get_all_triggers_history(
            agent_id, function_name, status, success, page, size
        )

    async def count_number_of_executed_transactions(self, agent_id: Optional[str] = None):
        query = {}

        if agent_id is not None:
            agent = await self.db.prisma.agent.find_first(where={"id": agent_id})
            if agent is None:
                raise HTTPException(status_code=404, content=f"Agent with {agent_id} does not exist")
            else:
                query["agentId"] = agent_id

        transactions = await self.trigger_history_repo.get_trigger_history_by_query(query)
        total_txs = len(transactions)
        successful_txs = len([tx for tx in transactions if tx.success])
        skipped_txs = len([tx for tx in transactions if not tx.status])
        unsuccessful_txs = total_txs - successful_txs
        unskipped_txs = total_txs - skipped_txs

        return {
            "total_transactions": total_txs,
            "successful_transactions": successful_txs,
            "unsuccessful_transactions": unsuccessful_txs,
            "skipped_transactions": skipped_txs,
            "unskipped_transactions": unskipped_txs,
        }

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

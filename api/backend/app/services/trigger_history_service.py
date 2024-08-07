from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any

from fastapi_pagination import Page

from backend.app.exceptions import HTTPException
from backend.app.models.trigger_history.trigger_history_dto import TriggerHistoryDto
from backend.app.repositories.trigger_history_repository import TriggerHistoryRepository
from backend.config.database import prisma_connection
from backend.app.utils.extras import calculate_change_rate
from datetime import datetime, timezone
from backend.app.models.trigger_history.trigger_history_dto import TriggerHistoryDto


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

    async def calculate_trigger_metric_by_query(self, function_name: list[str], agent_id: str):
        query = self.format_query(function_name, agent_id)
        response = {"function_name": function_name}

        # for different trigger results length
        trigger_result_types = {
            "no_of_successful_triggers": {"status": True, "success": True},
            "no_of_unsuccessful_triggers": {"status": True, "success": False},
            "no_of_skipped_triggers": {"status": False, "success": False},
        }
        for key, value in trigger_result_types.items():
            filters = {**value}
            triggers_len = await self.db.prisma.triggerhistory.count(where=query | filters)
            response[key] = triggers_len

        raw_successfull_triggers_last_hour = await self.db.prisma.query_raw(
            self.build_query("last_hour", agent_id, function_name)
        )

        raw_successful_triggers_last_24_hours = await self.db.prisma.query_raw(
            self.build_query("last_24_hours", agent_id, function_name)
        )

        raw_successful_triggers_last_7_days = await self.db.prisma.query_raw(
            self.build_query("last_7_days", agent_id, function_name)
        )

        fluctuation_rate = await self.get_fluctuation_rate(agent_id=agent_id, function_name=function_name)
        # Format results to match the expected format
        response.update(
            {
                "last_hour_successful_triggers": self.process_chart_data(raw_successfull_triggers_last_hour, 60),
                "last_24hour_successful_triggers": self.process_chart_data(raw_successful_triggers_last_24_hours, 24),
                "last_week_successful_triggers": self.process_chart_data(raw_successful_triggers_last_7_days, 7),
                "today_fluctuation_rate": fluctuation_rate,
            }
        )
        return response

    def format_query(self, function_name: list[str] = None, agent_id: str = None):
        query = {}
        if agent_id is not None:
            query["agentId"] = agent_id
        if function_name is not None:
            query["functionName"] = {"in": function_name}
        return query

    def process_chart_data(self, raw_data: List[Dict[str, Any]], max_range: int) -> List[Dict[str, Any]]:
        result = [{"count": 0, "values": {}} for _ in range(max_range)]
        now = datetime.now(timezone.utc)
        for item in raw_data:
            timestamp_str = item.get("minute") or item.get("hour") or item.get("day")
            if timestamp_str:
                timestamp = datetime.fromisoformat(timestamp_str).replace(tzinfo=timezone.utc)
                if max_range == 60:  # Last hour
                    index = int((now - timestamp).total_seconds() / 60) % 60
                elif max_range == 24:  # Last 24 hours
                    index = int((now - timestamp).total_seconds() / 3600) % 24
                elif max_range == 7:  # Last 7 days
                    index = (now.date() - timestamp.date()).days % 7
                else:
                    continue
                result[index]["count"] += item["successful_triggers"]
                result[index]["values"][item.get("functionName", "Unknown")] = item["successful_triggers"]
        return result

    def build_query(
        self, time_interval: str, agent_id: Optional[str] = None, function_name: Optional[List[str]] = None
    ) -> str:
        if time_interval not in ["last_hour", "last_24_hours", "last_7_days"]:
            raise ValueError("Invalid time interval. Must be 'last_hour', 'last_24_hours', or 'last_7_days'.")
        time_intervals = {
            "last_hour": "NOW() - INTERVAL '60 minutes'",
            "last_24_hours": "NOW() - INTERVAL '24 hours'",
            "last_7_days": "NOW() - INTERVAL '7 days'",
        }
        # Base query
        query = f"""
            SELECT
                date_trunc('minute', "timestamp") AS minute,
                "functionName",
                COUNT(*) AS successful_triggers
            FROM
                "TriggerHistory"
            WHERE
                status = true
                AND success = true
                AND "timestamp" >= {time_intervals[time_interval]}
        """
        # Add Agend id filter and function filter if required
        if agent_id:
            query += f" AND \"agentId\" = '{agent_id}'"
        if function_name:
            function_names = ", ".join([f"'{fn}'" for fn in function_name])
            query += f' AND "functionName" IN ({function_names})'

        # Add group by and order by clauses
        query += """
            GROUP BY
                minute, "functionName"
            ORDER BY
                minute DESC, "functionName";
        """
        return query

    async def get_fluctuation_rate(self, agent_id: Optional[str] = None, function_name: Optional[List[str]] = None):
        now = datetime.now(timezone.utc)
        start_of_today = now - timedelta(
            hours=now.hour, minutes=now.minute, seconds=now.second, microseconds=now.microsecond
        )
        start_of_yesterday = start_of_today - timedelta(days=1)

        # Base filter conditions
        base_filter = {
            "success": True,
            "status": True,
        }

        # Apply optional filters
        if agent_id:
            base_filter["agentId"] = agent_id

        if function_name:
            base_filter["functionName"] = {"in": function_name}

        # Fetch successful triggers from the last day (excluding today)
        last_day_successful_triggers = await self.db.prisma.triggerhistory.count(
            where={**base_filter, "timestamp": {"gt": start_of_yesterday, "lt": start_of_today}}
        )

        # Fetch successful triggers from today
        today_successful_triggers = await self.db.prisma.triggerhistory.count(
            where={**base_filter, "timestamp": {"gt": start_of_today}}
        )
        return calculate_change_rate(last_day_successful_triggers, today_successful_triggers)

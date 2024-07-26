from collections import defaultdict
from datetime import datetime, timedelta
from http import HTTPStatus
from http.client import HTTPException
from typing import List, Optional

from classy_fastapi import Routable, post, get, put, delete
from fastapi import Query

from backend.app.models.trigger_history.trigger_history_dto import TriggerHistoryDto
from backend.app.services.trigger_history_service import TriggerHistoryService
from backend.config.database import prisma_connection
from fastapi_pagination import Page, paginate
from backend.dependency import trigger_history_service


class TriggerHistory(Routable):
    def __init__(
        self,
        db_connection=None,
        trigger_history_service: TriggerHistoryService = trigger_history_service,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.db = db_connection or prisma_connection
        self.trigger_history_service = trigger_history_service

    @get("/trigger-history", response_model=Page[TriggerHistoryDto])
    async def get_all_trigger_history(
        self,
        agent_id: Optional[str] = None,
        function_name: Optional[list[str]] = Query(None),
        status: Optional[bool] = None,
        success: Optional[bool] = None,
    ):
        return await self.trigger_history_service.get_all_trigger_history(agent_id, function_name, status, success)

    @get("/transaction-counts", response_model=dict)
    async def get_transaction_counts_success(self):
        return await self.trigger_history_service.count_number_of_executed_transactions()

    @get("/transaction-counts/{agent_id}", response_model=dict)
    async def get_transaction_counts_agent_id(self, agent_id: str):
        return await self.trigger_history_service.count_number_of_executed_transactions(agent_id=agent_id)

    @get("/trigger-metric", response_model=dict)
    async def get_trigger_metric(
        self, function_name: Optional[list[str]] = Query(None), agent_id: Optional[str] = None
    ):
        return await self.trigger_history_service.calculate_trigger_metric(
            function_name=function_name, agent_id=agent_id
        )

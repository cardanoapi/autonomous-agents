from http import HTTPStatus
from typing import List

from classy_fastapi import Routable, get, post, put, delete
from fastapi import HTTPException

from backend.app.models import TriggerResponse
from backend.app.models import TriggerCreateDTO
from backend.app.services.trigger_service import TriggerService
from backend.dependency import get_trigger_service


class TriggerRouter(Routable):
    def __init__(self, trigger_service: TriggerService = get_trigger_service(), *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trigger_service = trigger_service

    @post("/agents/{agent_id}/triggers", status_code=HTTPStatus.CREATED)
    async def create_trigger(self, agent_id: str, trigger_data: TriggerCreateDTO):
        trigger = await self.trigger_service.create_trigger(agent_id, trigger_data)
        return trigger

    @get("/agents/{agent_id}/triggers", response_model=List[TriggerResponse])
    async def list_triggers_by_agent_id(self, agent_id: str):
        triggers = await self.trigger_service.list_triggers_by_agent_id(agent_id)
        return triggers

    @get("/triggers/{trigger_id}", response_model=TriggerResponse)
    async def list_trigger_by_trigger_id(self, trigger_id: str):
        trigger = await self.trigger_service.list_trigger_by_id(trigger_id)
        return trigger

    @put("/triggers/{trigger_id}", response_model=TriggerResponse)
    async def update_trigger_by_trigger_id(self, trigger_id: str, trigger_data: TriggerCreateDTO):
        trigger = await self.trigger_service.update_trigger_by_id(trigger_id, trigger_data)
        return trigger

    @delete("/triggers/{trigger_id}", status_code=HTTPStatus.NO_CONTENT)
    async def delete_trigger_by_trigger_id(self, trigger_id: str):
        success = await self.trigger_service.delete_by_id(trigger_id)
        if not success:
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Trigger not found")

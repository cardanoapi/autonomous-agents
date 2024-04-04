from typing import List

from backend.app.models.trigger.resposne_dto import TriggerResponse
from backend.app.models.trigger.trigger_dto import TriggerCreateDTO
from backend.app.repositories.trigger_repository import TriggerRepository


class TriggerService:
    def __init__(self, trigger_repository: TriggerRepository):
        self.trigger_repository = trigger_repository

    async def create_trigger(self, agent_id: str, trigger_data: TriggerCreateDTO) -> TriggerResponse:
        return await self.trigger_repository.save_trigger(agent_id, trigger_data)

    async def list_triggers(self) -> List[TriggerResponse]:
        return await self.trigger_repository.retreive_triggers()

    async def list_triggers_by_agent_id(self, agent_id: str) -> List[TriggerResponse]:
        return await self.trigger_repository.retreive_triggers_by_agent_id(agent_id)

    async def delete_by_id(self, trigger_id: str) -> bool:
        return await self.trigger_repository.remove_trigger_by_trigger_id(trigger_id)

    async def list_trigger_by_id(self, trigger_id: str) -> TriggerResponse:
        return await self.trigger_repository.retreive_trigger_by_id(trigger_id)

    async def update_trigger_by_id(self, trigger_id: str, trigger_data: TriggerCreateDTO) -> TriggerResponse:
        return await self.trigger_repository.modify_trigger_by_id(trigger_id, trigger_data)

from typing import List

from backend.app.models.TriggerDto.resposne_dto import TriggerResponse
from backend.app.models.TriggerDto.trigger_dto import TriggerCreateDTO, TriggerEditDTO
from backend.app.repositories.trigger_repository import TriggerRepository


class TriggerService:
    def __init__(self, trigger_repository: TriggerRepository):
        self.trigger_repository = trigger_repository

    async def create_trigger(self, trigger_data: TriggerCreateDTO) -> TriggerResponse:
        return await self.trigger_repository.save_trigger(trigger_data)

    async def list_triggers(self) -> List[TriggerResponse]:
        return await self.trigger_repository.retreive_triggers()

    async def list_triggers_by_agent_id(self, agent_id: str) -> List[TriggerResponse]:
        return await self.trigger_repository.retreive_triggers_by_agent_id(agent_id)

    async def delete_trigger_by_agent_id_and_trigger_id(self, agent_id: str, trigger_id: str) -> bool:
        return await self.trigger_repository.remove_trigger_by_agent_id_trigger_id(agent_id, trigger_id)

    async def list_trigger_by_agent_id_and_trigger_id(self, agent_id: str, trigger_id: str) -> TriggerResponse:
        return await self.trigger_repository.retreive_trigger_by_agent_id_and_trigger_id(agent_id, trigger_id)

    async def update_trigger_by_agent_id_and_trigger_id(
        self, agent_id: str, trigger_id: str, trigger_data: TriggerEditDTO
    ) -> TriggerResponse:
        return await self.trigger_repository.modify_trigger_by_agent_id_and_trigger_id(
            agent_id, trigger_id, trigger_data
        )

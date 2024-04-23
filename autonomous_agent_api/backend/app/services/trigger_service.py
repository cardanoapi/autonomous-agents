from typing import List

from backend.app.models.trigger.resposne_dto import TriggerResponse
from backend.app.models.trigger.trigger_dto import TriggerCreateDTO
from backend.app.repositories.trigger_repository import TriggerRepository
from backend.app.services.websocket_manager_service import manager


class TriggerService:
    def __init__(self, trigger_repository: TriggerRepository):
        self.trigger_repository = trigger_repository

    async def create_trigger(self, agent_id: str, trigger_data: TriggerCreateDTO) -> TriggerResponse:
        trigger_response = await self.trigger_repository.save_trigger(agent_id, trigger_data)

        await self.notify_trigger_config_updated(trigger_response.agent_id)

        return trigger_response

    async def list_triggers(self) -> List[TriggerResponse]:
        return await self.trigger_repository.retreive_triggers()

    async def list_triggers_by_agent_id(self, agent_id: str) -> List[TriggerResponse]:
        return await self.trigger_repository.retreive_triggers_by_agent_id(agent_id)

    async def delete_by_id(self, trigger_id: str) -> bool:
        return await self.trigger_repository.remove_trigger_by_trigger_id(trigger_id)

    async def list_trigger_by_id(self, trigger_id: str) -> TriggerResponse:
        return await self.trigger_repository.retreive_trigger_by_id(trigger_id)

    async def update_trigger_by_id(self, trigger_id: str, trigger_data: TriggerCreateDTO) -> TriggerResponse:
        # Call the repository method to modify the trigger data
        trigger_response = await self.trigger_repository.modify_trigger_by_id(trigger_id, trigger_data)

        # Notify the change if necessary
        await self.notify_trigger_config_updated(trigger_response.agent_id)

        return trigger_response

    async def notify_trigger_config_updated(self, agent_id: str):
        # Here, notify the WebSocket manager to send a message about the config update
        if await manager.check_if_agent_active(agent_id):
            await manager.send_message_to_websocket(agent_id, {"message": "config_updated"})

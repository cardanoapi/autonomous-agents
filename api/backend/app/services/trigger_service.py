import os
from typing import List
from backend.app.models.trigger.resposne_dto import TriggerResponse
from backend.app.models.trigger.trigger_dto import (
    TriggerCreateDTO,
)
from backend.app.services.kafka_service import KafkaService
from backend.app.repositories.trigger_repository import TriggerRepository


class TriggerService:
    def __init__(self, trigger_repository: TriggerRepository, kafka_service: KafkaService):
        self.trigger_repository = trigger_repository
        self.kafka_service = kafka_service

    async def create_trigger(self, agent_id: str, trigger_data: TriggerCreateDTO) -> TriggerResponse:
        trigger_response = await self.trigger_repository.save_trigger(agent_id, trigger_data)

        await self.publish_trigger_event(trigger_response.agent_id)

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
        # Publish message to Kafka topic
        await self.publish_trigger_event(trigger_response.agent_id)

        return trigger_response

    async def update_trigger_for_agent(self, agent_id: str, agent_configurations: List[TriggerResponse]):
        for agent_config in agent_configurations:
            await self.trigger_repository.modify_trigger_by_id(agent_config.id, TriggerCreateDTO(**agent_config.dict()))

        await self.publish_trigger_event(agent_id)
        return await self.list_triggers_by_agent_id(agent_id)

    async def publish_trigger_event(self, agent_id: str):
        await self.kafka_service.publish_message("trigger_config_updates", "config_updated", key=agent_id)

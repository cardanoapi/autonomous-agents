from typing import List

from backend.app.models.trigger.resposne_dto import TriggerResponse
from backend.app.models.trigger.trigger_dto import (
    TriggerCreateDTO,
)
from backend.app.repositories.trigger_repository import TriggerRepository
from backend.app.services.kafka_service import KafkaService
from backend.config.api_settings import api_settings


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

    async def count_triggers_by_agent_id(self, agent_id: str) -> int:
        return await self.trigger_repository.count_triggers_by_agent_id(agent_id)

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

    async def update_configurations_for_agent(self, agent_id: str, agent_configurations: List[TriggerResponse]):
        agent_existing_configuration_ids = [config.id for config in await self.list_triggers_by_agent_id(agent_id)]
        updating_configuration_ids = [config.id for config in agent_configurations]
        configs_to_delete = [
            config_id for config_id in agent_existing_configuration_ids if config_id not in updating_configuration_ids
        ]
        updated_configs = await self.update_agent_multiple_configs(agent_configurations)
        await self.delete_agent_multiple_configs(configs_to_delete)
        return updated_configs

    async def update_agent_multiple_configs(self, agent_configurations: List[TriggerResponse]):
        updated_configs = []
        new_configs = [config for config in agent_configurations if config.id == ""]
        updating_configs = [config for config in agent_configurations if config.id != ""]
        for config in updating_configs:
            res = await self.trigger_repository.modify_trigger_by_id(config.id, TriggerCreateDTO(**config.dict()))
            updated_configs.append(res)
        for config in new_configs:
            res = await self.trigger_repository.save_trigger(config.agent_id, TriggerCreateDTO(**config.dict()))
            updated_configs.append(res)
        return updated_configs

    async def delete_agent_multiple_configs(self, config_ids: List[str]):
        for config_id in config_ids:
            await self.trigger_repository.remove_trigger_by_trigger_id(config_id)

    async def publish_trigger_event(self, agent_id: str):
        await self.kafka_service.publish_message(
            api_settings.getKafkaTopicPrefix() + "trigger_config_updates", "config_updated", key=agent_id
        )

from typing import List

from prisma import Prisma

from backend.app.models import TemplateTriggerCreateDto, TemplateTriggerResponse
from backend.app.models.template_trigger.response_dto import TemplateTriggerResponse
from backend.app.repositories.template_trigger_repository import (
    TemplateTriggerRepository,
)


class TemplateTriggerService:
    def __init__(self, template_trigger_repository: TemplateTriggerRepository):
        self.template_trigger_repository = template_trigger_repository

    async def create_template_trigger(self, transaction: Prisma, template_id, template_data):
        return await self.template_trigger_repository.save_template_trigger(transaction, template_id, template_data)

    async def list_templates_trigger(self) -> List[TemplateTriggerResponse]:
        return await self.template_trigger_repository.retrieve_templates_trigger()

    async def get_template_trigger(self, template_id: str) -> List[TemplateTriggerResponse]:
        return await self.template_trigger_repository.retrieve_template_trigger(template_id)

    async def update_template_trigger(
        self, template_trigger_id: str, template_data: TemplateTriggerCreateDto
    ) -> TemplateTriggerResponse:
        return await self.template_trigger_repository.modify_template_trigger(template_trigger_id, template_data)

    async def update_configurations_for_template(
        self, template_id: str, template_configurations: List[TemplateTriggerResponse]
    ):
        updated_configs = []
        template_existing_config_ids = [config.id for config in await self.get_template_trigger(template_id)]
        updating_configuration_ids = [config.id for config in template_configurations]
        configs_to_delete = [
            config_id for config_id in template_existing_config_ids if config_id not in updating_configuration_ids
        ]
        for config in template_configurations:
            updated_config = await self.template_trigger_repository.modify_template_trigger(
                config.id, TemplateTriggerCreateDto(**config.dict())
            )
            updated_configs.append(updated_config)
        for config_id in configs_to_delete:
            template = await self.template_trigger_repository.remove_template_trigger(config_id)
        return updated_configs

    async def delete_template_trigger(self, template_trigger_id: str) -> None:
        await self.template_trigger_repository.remove_template_trigger(template_trigger_id)

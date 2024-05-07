from typing import List

from backend.app.models import TemplateTriggerCreateDto, TemplateTriggerResponse
from backend.app.repositories.template_trigger_repository import (
    TemplateTriggerRepository,
)


class TemplateTriggerService:
    def __init__(self, template_trigger_repository: TemplateTriggerRepository):
        self.template_trigger_repository = template_trigger_repository

    async def create_template_trigger(self, template_id, template_data):
        return await self.template_trigger_repository.save_template_trigger(
            template_id, template_data
        )

    async def list_templates_trigger(self) -> List[TemplateTriggerResponse]:
        return await self.template_trigger_repository.retrieve_templates_trigger()

    async def get_template_trigger(self, template_id: str) -> TemplateTriggerResponse:
        return await self.template_trigger_repository.retrieve_template_trigger(
            template_id
        )

    async def update_template_trigger(
        self, template_trigger_id: str, template_data: TemplateTriggerCreateDto
    ) -> TemplateTriggerResponse:
        return await self.template_trigger_repository.modify_template_trigger(
            template_trigger_id, template_data
        )

    async def delete_template_trigger(self, template_trigger_id: str) -> None:
        await self.template_trigger_repository.remove_template_trigger(
            template_trigger_id
        )
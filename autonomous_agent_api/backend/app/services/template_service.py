from typing import List

from backend.app.models import TemplateResponse, TemplateCreateDto
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.repositories.template_trigger_repository import (
    TemplateTriggerRepository,
)
from backend.app.services.template_trigger_service import TemplateTriggerService


class TemplateService:
    def __init__(
        self,
        template_repository: TemplateRepository,
        template_trigger_service: TemplateTriggerService,
    ):
        self.template_repository = template_repository
        self.template_trigger_service = template_trigger_service

    async def create_template(self, template_data):
        template = await self.template_repository.save_template(template_data)
        # Save the template triggers
        template_id = template["id"]
        template_triggers = template["template_triggers"]
        template_trigger_responses = []

        if template_triggers:
            for trigger_data in template_triggers:
                template_trigger_response = (
                    await self.template_trigger_service.create_template_trigger(
                        template_id, trigger_data
                    )
                )
                template_trigger_responses.append(template_trigger_response)

        template_response = TemplateResponse(
            id=template["id"],
            name=template_data.name,
            description=template_data.description,
            template_triggers=template_trigger_responses
            if template_trigger_responses
            else [],
        )

        return template_response

    async def list_templates(self) -> List[TemplateResponse]:
        return await self.template_repository.retrieve_templates()

    async def get_template(self, template_id: str) -> TemplateResponse:
        return await self.template_repository.retrieve_template(template_id)

    async def update_template(
        self, template_id: str, template_data: TemplateCreateDto
    ) -> TemplateResponse:
        return await self.template_repository.modify_template(
            template_id, template_data
        )

    async def delete_template(self, template_id: str) -> None:
        await self.template_repository.remove_template(template_id)
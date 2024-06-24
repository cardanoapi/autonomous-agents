from typing import List

from backend.app.exceptions.http import HTTPException

from backend.app.models import TemplateResponse, TemplateCreateDto
from backend.app.models.template.template_dto import TemplateEditDto
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.repositories.template_trigger_repository import (
    TemplateTriggerRepository,
)
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.config.database import prisma_connection


class TemplateService:
    def __init__(
        self,
        template_repository: TemplateRepository,
        template_trigger_service: TemplateTriggerService,
    ):
        self.template_repository = template_repository
        self.template_trigger_service = template_trigger_service

    async def create_template(self, template_data):
        # creating the instance of prisma transaction for template and template trigger creation
        async with prisma_connection.prisma.tx() as transaction:
            template = await self.template_repository.save_template(transaction, template_data)
            # Save the template triggers
            template_id = template["id"]
            template_triggers = template["template_triggers"]
            template_trigger_responses = []

            if template_triggers:
                for trigger_data in template_triggers:
                    template_trigger_response = await self.template_trigger_service.create_template_trigger(
                        transaction, template_id, trigger_data
                    )
                    template_trigger_responses.append(template_trigger_response)

            template_response = TemplateResponse(
                id=template["id"],
                name=template_data.name,
                description=template_data.description,
            )

        return template_response

    async def list_templates(self, page, limit) -> List[TemplateResponse]:
        return await self.template_repository.retrieve_templates(page, limit)

    async def get_template(self, template_id: str) -> TemplateResponse:
        template = await self.template_repository.retrieve_template(template_id)
        self.raise_exception_if_template_not_found(template)
        return template

    async def update_template(self, template_id: str, template_data: TemplateEditDto) -> TemplateResponse:
        template = await self.template_repository.modify_template(template_id, template_data)
        self.raise_exception_if_template_not_found(template)
        return template

    async def delete_template(self, template_id: str) -> None:
        template = await self.template_repository.remove_template(template_id)
        self.raise_exception_if_template_not_found(template)
        return True

    def raise_exception_if_template_not_found(self, template):
        if template is None or False:
            raise HTTPException(status_code=404, content="Template not Found")

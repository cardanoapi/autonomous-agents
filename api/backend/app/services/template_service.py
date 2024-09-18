from typing import List

from backend.app.exceptions.http import HTTPException

from backend.app.models import TemplateResponse, TemplateCreateDto, TemplateResponseWithConfigurations
from backend.app.models.template.template_dto import TemplateEditDto
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.repositories.template_trigger_repository import (
    TemplateTriggerRepository,
)
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.config.database import prisma_connection
from backend.app.repositories.user_repository import UserRepository


class TemplateService:
    def __init__(
        self,
        template_repository: TemplateRepository,
        template_trigger_service: TemplateTriggerService,
    ):
        self.template_repository = template_repository
        self.template_trigger_service = template_trigger_service
        self.user_repository = UserRepository()

    async def create_template(self, template_data, userAddress: str):

        await self.is_superadmin(userAddress)
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

    async def list_templates(
        self, page: int, size: int, search: str | None
    ) -> List[TemplateResponseWithConfigurations]:
        templates_with_configurations = []
        templates = await self.template_repository.retrieve_templates(page, size, search)
        for template in templates:
            template_configurations = await self.template_trigger_service.get_template_trigger(template.id)
            updated_template = TemplateResponseWithConfigurations(
                **template.dict(), template_configurations=template_configurations
            )
            templates_with_configurations.append(updated_template)
        return templates_with_configurations

    async def get_template(self, template_id: str) -> TemplateResponseWithConfigurations:
        template = await self.template_repository.retrieve_template(template_id)
        template_configurations = await self.template_trigger_service.get_template_trigger(template_id)
        self.raise_exception_if_template_not_found(template)
        return TemplateResponseWithConfigurations(**template.dict(), template_configurations=template_configurations)

    async def update_template(
        self, template_id: str, template_data: TemplateEditDto, userAddress: str
    ) -> TemplateResponseWithConfigurations:

        await self.is_superadmin(userAddress)

        updating_template_detail = TemplateEditDto(
            name=template_data.name, description=template_data.description, userAddress=template_data.userAddress
        )
        updated_template = await self.template_repository.modify_template(template_id, updating_template_detail)
        self.raise_exception_if_template_not_found(updated_template)
        updated_template_configurations = await self.template_trigger_service.update_configurations_for_template(
            template_id, template_data.template_configurations
        )
        return TemplateResponseWithConfigurations(
            **updated_template, template_configurations=updated_template_configurations
        )

    async def delete_template(self, template_id: str, userAddress: str) -> str:

        await self.is_superadmin(userAddress)

        template = await self.template_repository.remove_template(template_id)
        self.raise_exception_if_template_not_found(template)
        return template_id

    def raise_exception_if_template_not_found(self, template):
        if template is None or False:
            raise HTTPException(status_code=404, content="Template not Found")

    async def is_superadmin(self, userAddress: str):
        user_is_super_admin = await self.user_repository.is_super_admin(userAddress)
        print(f"{userAddress} - {user_is_super_admin}")
        if user_is_super_admin == False:
            raise HTTPException(status_code=403, content="Forbidden Request")

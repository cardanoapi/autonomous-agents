from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import ValidationError

from backend.app.controllers.template_router import TemplateRouter
from backend.app.models.template.response_dto import TemplateResponse
from backend.app.models.template.template_dto import TemplateCreateDto
from backend.app.services.template_service import TemplateService


@pytest.mark.asyncio
@pytest.mark.github_actions
class TestCreateTrigger:
    @pytest.fixture
    def template_service(self):
        return MagicMock(spec=TemplateService)

    @pytest.fixture
    def template_router(self, template_service):
        return TemplateRouter(template_service)

    async def test_create_template_pass_with_valid_data(self, template_router, template_service):
        # Example input data
        template_data = TemplateCreateDto(
            name="Test Template",
            description="This is a test template",
            template_triggers=[
                {
                    "type": "CRON",
                    "action": {"function_name": "string", "parameter": ["1", "2"]},
                    "data": {"frequency": "* * * * *", "probability": 1},
                }
            ],
        )

        # Expected template response
        expected_template_response = TemplateResponse(
            id="random_uuid",  # Assuming you know the UUID generated
            name=template_data.name,
            description=template_data.description,
        )

        # Mock the coroutine result
        template_service.create_template.return_value = expected_template_response

        # Invoke the create_template method under test
        result = await template_router.create_template(template_data)

        # Assertions
        template_service.create_template.assert_called_once_with(template_data)
        assert result == expected_template_response

    async def test_create_template_fail_with_invalid_data(self, template_router, template_service):
        with pytest.raises(ValidationError):
            # Example input data
            template_data = TemplateCreateDto(
                name="Test Template",
                description="This is a test template",
            )

            # Expected template response
            expected_template_response = TemplateResponse(
                id="random_uuid",  # Assuming you know the UUID generated
                name=template_data.name,
                description=template_data.description,
            )

            # Mock the coroutine result
            template_service.create_template.return_value = expected_template_response

            # Invoke the create_template method under test
            result = await template_router.create_template(template_data)

            # Assertions
            template_service.create_template.assert_called_once_with(template_data)
            assert result == expected_template_response

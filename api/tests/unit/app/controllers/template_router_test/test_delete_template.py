from unittest.mock import MagicMock

import pytest

from backend.app.controllers.template_router import TemplateRouter
from backend.app.services.template_service import TemplateService


@pytest.mark.asyncio
@pytest.mark.github_actions
@pytest.mark.skip
class TestTemplateDelete:
    @pytest.fixture
    def template_service(self):
        return MagicMock(spec=TemplateService)

    @pytest.fixture
    def template_router(self, template_service):
        return TemplateRouter(template_service)

    async def test_delete_template_with_valid_id(self, template_service, template_router):
        # Mock data
        template_id = "018e8909-549b-7b9f-8fab-5499f53a8244"

        await template_router.delete_template(template_id)

        template_service.delete_template.assert_called_once_with(template_id)

    async def test_delete_template_should_fail_with_no_id(self, template_service, template_router):
        # Mock data
        with pytest.raises(TypeError):
            await template_router.delete_template()

            template_service.delete_template.assert_called_once_with()

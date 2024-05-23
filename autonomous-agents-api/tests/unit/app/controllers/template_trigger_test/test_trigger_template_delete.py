import pytest
from unittest.mock import MagicMock, AsyncMock

from backend.app.controllers.template_trigger_router import TemplateTriggerRouter
from backend.app.controllers.trigger_router import TriggerRouter
from backend.app.services.template_trigger_service import TemplateTriggerService

from backend.app.services.trigger_service import TriggerService


@pytest.mark.asyncio
@pytest.mark.github_actions
class TestDeleteTemplateTrigger:
    @pytest.fixture
    def trigger_template_service(self):
        return MagicMock(spec=TemplateTriggerService)

    @pytest.fixture
    def template_trigger_router(self, trigger_template_service):
        return TemplateTriggerRouter(trigger_template_service)

    async def test_delete_template_trigger_with_valid_id(
        self, trigger_template_service, template_trigger_router
    ):
        # Mock data
        template_trigger_id = "018e8909-549b-7b9f-8fab-5499f53a8244"

        await template_trigger_router.delete_template_trigger(template_trigger_id)

        trigger_template_service.delete_template_trigger.assert_called_once_with(
            template_trigger_id
        )

    async def test_delete_template_trigger_should_fail_with_no_id(
        self, trigger_template_service, template_trigger_router
    ):
        # Mock data
        with pytest.raises(TypeError):
            await template_trigger_router.delete_template_trigger()

            trigger_template_service.delete_template_trigger.assert_called_once_with()

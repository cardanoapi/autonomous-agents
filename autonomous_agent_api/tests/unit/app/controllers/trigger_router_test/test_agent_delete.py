import pytest
from unittest.mock import MagicMock, AsyncMock
from backend.app.controllers.trigger_router import TriggerRouter

from backend.app.services.trigger_service import TriggerService


@pytest.mark.asyncio
class TestDeleteTrigger:
    @pytest.fixture
    def trigger_service(self):
        return MagicMock(spec=TriggerService)

    @pytest.fixture
    def trigger_router(self, trigger_service):
        return TriggerRouter(trigger_service)

    @pytest.mark.asyncio
    async def test_delete_trigger_with_valid_id(self, trigger_service, trigger_router):
        # Mock data
        trigger_id = "018e8909-549b-7b9f-8fab-5499f53a8244"

        await trigger_router.delete_trigger_by_trigger_id(trigger_id)

        trigger_service.delete_by_id.assert_called_once_with(trigger_id)

    @pytest.mark.asyncio
    async def test_delete_trigger_should_fail_with_no_id(self, trigger_service, trigger_router):
        # Mock data
        with pytest.raises(TypeError):
            await trigger_router.delete_trigger_by_trigger_id()

            trigger_service.delete_by_id.assert_called_once_with()

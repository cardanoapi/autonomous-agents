from http.client import HTTPException

import pytest
from unittest.mock import MagicMock, AsyncMock
from backend.app.controllers.trigger_router import TriggerRouter
from http import HTTPStatus

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
    async def test_delete_trigger_by_trigger_id_success(self, trigger_router, trigger_service):
        # Define test data
        trigger_id = "trigger_id"
        trigger_service.delete_by_id = AsyncMock(return_value=True)

        # Perform the test
        response = await trigger_router.delete_trigger_by_trigger_id(trigger_id)

        # Assertions
        assert response.status_code == HTTPStatus.NO_CONTENT
        trigger_service.delete_by_id.assert_called_once_with(trigger_id)

    @pytest.mark.asyncio
    async def test_delete_trigger_by_trigger_id_failure(self, trigger_router, trigger_service):
        # Define test data
        trigger_id = 532
        trigger_service.delete_by_id = AsyncMock(return_value=False)

        # Perform the test
        with pytest.raises(HTTPException) as exc_info:
            await trigger_router.delete_trigger_by_trigger_id(trigger_id)

        # Assertions
        assert exc_info.value.status_code == HTTPStatus.NOT_FOUND

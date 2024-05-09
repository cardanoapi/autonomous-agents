from pydantic import ValidationError

from backend.app.controllers.trigger_router import TriggerRouter
from backend.app.models import TriggerCreateDTO, TriggerResponse
from backend.app.services.trigger_service import TriggerService
from unittest.mock import MagicMock, AsyncMock
import pytest


@pytest.mark.github_actions
@pytest.mark.asyncio
class TestCreateTrigger:
    @pytest.fixture
    def trigger_service(self):
        return MagicMock(spec=TriggerService)

    @pytest.fixture
    def trigger_router(self, trigger_service):
        return TriggerRouter(trigger_service)

    async def test_edit_trigger_with_valid_data(self, trigger_router, trigger_service):
        # Define test data
        id = "trigger_id"
        agent_id = "agent_id"
        valid_cron_trigger_data = TriggerCreateDTO(
            type="CRON",
            action={"function_name": "string", "parameter": ["string"]},
            data={"frequency": "* * * * *", "probability": 0.5},
        )
        updated_data = TriggerResponse(
            id=id,
            agent_id=agent_id,
            type="CRON",
            action={"function_name": "string", "parameter": ["string"]},
            data={"frequency": "* * * * *", "probability": 0.5},
        )

        trigger_service.update_trigger_by_id = AsyncMock(return_value=updated_data)

        result = await trigger_router.update_trigger_by_trigger_id(id, valid_cron_trigger_data)

        trigger_service.update_trigger_by_id.assert_called_once_with(id, valid_cron_trigger_data)

        assert result == updated_data

    async def test_edit_trigger_with_invalid_data(self, trigger_router, trigger_service):
        with pytest.raises(ValidationError):
            # Define test data
            id = "trigger_id"
            agent_id = "agent_id"
            valid_cron_trigger_data = TriggerCreateDTO(
                action={"function_name": "string", "parameter": ["string"]},
                data={"frequency": "* * * * *", "probability": 0.5},
            )
            updated_data = TriggerResponse(
                id=id,
                agent_id=agent_id,
                type="CRON",
                action={"function_name": "string", "parameter": ["string"]},
                data={"frequency": "* * * * *", "probability": 0.5},
            )

            trigger_service.update_trigger_by_id = AsyncMock(return_value=updated_data)

            result = await trigger_router.update_trigger_by_trigger_id(id, valid_cron_trigger_data)

            trigger_service.update_trigger_by_id.assert_called_once_with(id, valid_cron_trigger_data)

            assert result == updated_data

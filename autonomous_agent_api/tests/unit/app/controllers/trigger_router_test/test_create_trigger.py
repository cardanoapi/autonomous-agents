from pydantic import ValidationError

from backend.app.controllers.trigger_router import TriggerRouter
from backend.app.models import TriggerCreateDTO, TriggerResponse
from backend.app.services.trigger_service import TriggerService
from unittest.mock import MagicMock, AsyncMock
import pytest


@pytest.mark.asyncio
@pytest.mark.github_actions
class TestCreateTrigger:
    @pytest.fixture
    def trigger_service(self):
        return MagicMock(spec=TriggerService)

    @pytest.fixture
    def trigger_router(self, trigger_service):
        return TriggerRouter(trigger_service)


    async def test_create_trigger_with_valid_data(self, trigger_router, trigger_service):
        # Define test data
        id = "trigger_id"
        agent_id = "agent_id"
        valid_cron_trigger_data = TriggerCreateDTO(type="CRON",   action= {"function_name": "string","parameter": ["string"]}, data={"frequency": "* * * * *", "probability": 0.5})
        created_trigger = TriggerResponse(
            id=id,
            agent_id=agent_id,
            type="CRON",
            action= {"function_name": "string","parameter": ["string"]},
            data={"frequency": "* * * * *", "probability": 0.5},
        )

        trigger_service.create_trigger = AsyncMock(return_value=created_trigger)

        result = await trigger_router.create_trigger(agent_id, valid_cron_trigger_data)

        trigger_service.create_trigger.assert_called_once_with(agent_id, valid_cron_trigger_data)

        assert result == created_trigger


    async def test_create_trigger_with_Invalid_data_fail(self, trigger_router, trigger_service):
        with pytest.raises(ValidationError):
            id = "trigger_id"
            agent_id = "agent_id"
            valid_cron_trigger_data = TriggerCreateDTO(data={"frequency": "*", "probability": 0.5})
            created_trigger = TriggerResponse(
                id=id,
                agent_id=agent_id,
                type="CRON",
                data={"frequency": "* * * * *", "probability": 0.5},
            )

            trigger_service.create_trigger = AsyncMock(return_value=created_trigger)

            result = await trigger_router.create_trigger(agent_id, valid_cron_trigger_data)

            trigger_service.create_trigger.assert_called_once_with(agent_id, valid_cron_trigger_data)

            assert result == created_trigger

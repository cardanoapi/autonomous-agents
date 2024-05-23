from pydantic import ValidationError

from backend.app.controllers.template_trigger_router import TemplateTriggerRouter
from backend.app.controllers.trigger_router import TriggerRouter
from backend.app.models import TriggerCreateDTO, TriggerResponse
from backend.app.models.template_trigger.response_dto import TemplateTriggerResponse
from backend.app.models.template_trigger.template_trigger_dto import (
    TemplateTriggerCreateDto,
)
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.app.services.trigger_service import TriggerService
from unittest.mock import MagicMock, AsyncMock
import pytest


@pytest.mark.asyncio
@pytest.mark.github_actions
class TestCreateTemplateTrigger:
    @pytest.fixture
    def trigger_template_service(self):
        return MagicMock(spec=TemplateTriggerService)

    @pytest.fixture
    def template_trigger_router(self, trigger_template_service):
        return TemplateTriggerRouter(trigger_template_service)

    async def test_create_template_trigger_with_valid_data(
        self, template_trigger_router, trigger_template_service
    ):
        # Define test data
        id = "trigger_id"
        template_trigger_id = "trigger_id"
        valid_cron_trigger_data = TemplateTriggerCreateDto(
            description="desc",
            type="CRON",
            action={
                "function_name": "SendAda Token",
                "parameter": [
                    {
                        "name": "Receiver Address",
                        "value": "addr_test1qpxsqwr4lp7zrwcj5mjpzvmrlzry3makw5uve6ddhrzrm9q7epr775ukm23hed7jdy3vhme05dcy78x8suaqd0e73sgq4h298e",
                    }
                ],
            },
            data={"frequency": "* * * * *", "probability": 0.3},
        )
        created_trigger = TemplateTriggerResponse(
            id=id,
            template_id=id,
            description="desc",
            type="CRON",
            action={
                "function_name": "SendAda Token",
                "parameter": [
                    {
                        "name": "Receiver Address",
                        "value": "addr_test1qpxsqwr4lp7zrwcj5mjpzvmrlzry3makw5uve6ddhrzrm9q7epr775ukm23hed7jdy3vhme05dcy78x8suaqd0e73sgq4h298e",
                    }
                ],
            },
            data={"frequency": "* * * * *", "probability": 0.3},
        )

        trigger_template_service.update_template_trigger = AsyncMock(
            return_value=created_trigger
        )

        result = await template_trigger_router.update_template_trigger(
            id, valid_cron_trigger_data
        )

        assert result == created_trigger

    async def test_create_template_trigger_with_Invalid_data_fail(
        self, template_trigger_router, trigger_template_service
    ):
        with pytest.raises(ValidationError):
            # Define test data
            id = "trigger_id"
            template_trigger_id = "trigger_id"
            valid_cron_trigger_data = TemplateTriggerCreateDto(
                type="CRON",
                action={"function_name": "string", "parameter": ["string"]},
                data={"frequency": "* * * * *", "probability": 0.5},
            )
            created_trigger = TemplateTriggerResponse(
                id=id,
                template_id=id,
                description="desc",
                type="CRON",
                action={"function_name": "string", "parameter": ["string"]},
                data={"frequency": "* * * * *", "probability": 0.5},
            )

            trigger_template_service.update_template_trigger = AsyncMock(
                return_value=created_trigger
            )

            result = await template_trigger_router.update_template_trigger(
                id, valid_cron_trigger_data
            )

            assert result == created_trigger

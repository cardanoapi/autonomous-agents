from http import HTTPStatus

from pydantic import ValidationError

from backend.app.controllers.agent_router import AgentRouter
from backend.app.models.agent.agent_dto import AgentCreateDTO
from backend.app.models.agent.response_dto import AgentResponse
from backend.app.services.agent_service import AgentService
from unittest.mock import MagicMock, AsyncMock
import pytest


@pytest.mark.github_actions
@pytest.mark.asyncio
class TestAgentCreateRouter:
    @pytest.fixture
    def agent_service(self):
        return MagicMock(spec=AgentService)

    @pytest.fixture
    def agent_router(self, agent_service):
        return AgentRouter(agent_service)

    async def test_create_agent(self, agent_router, agent_service):
        # Example input data
        agent_data = AgentCreateDTO(
            name="Test Agent", template_id="template123", instance=1
        )

        # Expected agent response
        expected_agent_response = AgentResponse(
            id="random_uuid",  # Assuming you know the UUID generated
            name=agent_data.name,
            template_id=agent_data.template_id,
            instance=agent_data.instance,
            index=1,  # Assuming index is set to 1
        )

        # Set up mock behavior for agent_service.create_agent
        agent_service.create_agent.return_value = expected_agent_response

        # Invoke the create_agent method under test
        result = await agent_router.create_agent(agent_data)

        # Assertions
        assert result == expected_agent_response

    async def test_create_agent_should_fail_with_invalid_details(
        self, agent_service, agent_router
    ):
        with pytest.raises(ValidationError):
            # Example input data
            agent_data = AgentCreateDTO(name="", template_id="template123", instance=1)

            # Expected agent response
            expected_agent_response = AgentResponse(
                id="random_uuid",  # Assuming you know the UUID generated
                name=agent_data.name,
                template_id=agent_data.template_id,
                instance=agent_data.instance,
                index=1,  # Assuming index is set to 1
            )

            # Set up mock behavior for agent_service.create_agent
            agent_service.create_agent.return_value = expected_agent_response

            # Invoke the create_agent method under test
            result = await agent_router.create_agent(agent_data)

            # Assertions
            assert result == expected_agent_response

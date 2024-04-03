from pydantic import ValidationError

from backend.app.controllers.agent_router import AgentRouter
from backend.app.models.agent_dto import AgentCreateDTO
from backend.app.models.response_dto import AgentResponse
from backend.app.services.agent_service import AgentService
from unittest.mock import MagicMock, AsyncMock
import pytest


@pytest.mark.asyncio
class TestAgentEditRouter:
    @pytest.fixture
    def agent_service(self):
        return MagicMock(spec=AgentService)

    @pytest.fixture
    def agent_router(self, agent_service):
        return AgentRouter(agent_service)

    @pytest.mark.asyncio
    async def test_update_agent_with_valid_details(self, agent_service, agent_router):
        agent_id = "018e8909-549b-7b9f-8fab-5499f53a8244"
        agent_data = AgentCreateDTO(name="Updated Agent", triggers=["Test Description"], action=["Test Description"])
        updated_agent = AgentResponse(
            id=agent_id, name="Updated Agent", triggers=["Test Description"], action=["Test Description"]
        )

        agent_service.update_agent = AsyncMock(return_value=updated_agent)

        result = await agent_router.update_agent(agent_id, agent_data)

        agent_service.update_agent.assert_called_once_with(agent_id, agent_data)

        assert result == updated_agent

    @pytest.mark.asyncio
    async def test_update_agent_should_fail_with_invalid_details(self, agent_service, agent_router):
        with pytest.raises(ValidationError):
            # Mock data
            agent_id = "018e8909-549b-7b9f-8fab-5499f53a8244"
            agent_data = AgentCreateDTO(name="", triggers=["Test Description"], action=["Test Description"])
            updated_agent = AgentResponse(
                id=agent_id, name="Agent", triggers=["Test Description"], action=["Test Description"]
            )

            agent_service.update_agent = AsyncMock(return_value=updated_agent)

            result = await agent_router.update_agent(agent_id, agent_data)

            agent_service.update_agent.assert_called_once_with(agent_id, agent_data)

            assert result == updated_agent

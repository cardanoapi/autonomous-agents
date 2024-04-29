from pydantic import ValidationError

from backend.app.controllers.agent_router import AgentRouter
from backend.app.models.agent.agent_dto import AgentCreateDTO
from backend.app.models.agent.response_dto import AgentResponse
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
    async def test_create_agent_with_valid_details(self, agent_service, agent_router):
        agent_id = "018e8909-549b-7b9f-8fab-5499f53a8244"
        agent_data = AgentCreateDTO(name="Agent", action=["Test Description"])
        created_agent = AgentResponse(
            id=agent_id, name="Agent", action=["Test Description"]
        )

        agent_service.update_agent = AsyncMock(return_value=created_agent)

        result = await agent_router.create_agent(agent_id, agent_data)

        agent_service.update_agent.assert_called_once_with(agent_id, agent_data)

        assert result == created_agent

    @pytest.mark.asyncio
    async def test_create_agent_should_fail_with_invalid_details(
        self, agent_service, agent_router
    ):
        with pytest.raises(ValidationError):
            # Mock data
            agent_id = "018e8909-549b-7b9f-8fab-5499f53a8244"
            agent_data = AgentCreateDTO(name="", action=["Test Description"])
            created_agent = AgentResponse(
                id=agent_id, name="Agent", action=["Test Description"]
            )

            agent_service.update_agent = AsyncMock(return_value=created_agent)

            result = await agent_router.update_agent(agent_id, agent_data)

            agent_service.update_agent.assert_called_once_with(agent_id, agent_data)

            assert result == created_agent

import pytest
from unittest.mock import MagicMock, AsyncMock
from http import HTTPStatus
from backend.app.controllers.agent_router import AgentRouter
from fastapi import HTTPException
from fastapi import status


@pytest.mark.asyncio
@pytest.mark.github_actions
class TestAgentDelete:
    @pytest.fixture
    def agent_service(self):
        return AsyncMock()

    @pytest.fixture
    def agent_router(self, agent_service):
        return AgentRouter(agent_service)

    async def test_delete_agent_with_valid_id(self, agent_service, agent_router):
        # Mock data
        agent_id = "018e8909-549b-7b9f-8fab-5499f53a8244"

        await agent_router.delete_agent(agent_id)

        agent_service.delete_agent.assert_called_once_with(agent_id)

    async def test_delete_agent_should_fail_with_no_id(self, agent_service, agent_router):
        # Mock data
        with pytest.raises(TypeError):
            await agent_router.delete_agent()

            agent_service.delete_agent.assert_called_once_with()

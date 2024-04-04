from unittest.mock import MagicMock, AsyncMock

from backend.app.controllers.agent_router import AgentRouter
from backend.app.models.AgentDto.response_dto import AgentResponse
from backend.app.services.agent_service import AgentService

import pytest


@pytest.fixture
def agent_service():
    mock_service = MagicMock(spec=AgentService)
    return mock_service


@pytest.fixture
def agent_router(agent_service):
    return AgentRouter(agent_service)


# test for listing the agents
@pytest.mark.asyncio
async def test_list_agents_with_two_agents(agent_service, agent_router):
    # Mocking the list_agents method to return a list of mock agents
    mock_agents = [
        AgentResponse(
            id="018e8908-5dc9-78c9-b71a-37ebd2149394",
            name="Agent 1",
            action=["Description 1"],
        ),
        AgentResponse(
            id="018e8908-7563-7e8a-b87c-b33ac6e6c872",
            name="Agent 2",
            action=["Description 2"],
        ),
    ]
    agent_service.list_agents = AsyncMock(return_value=mock_agents)

    # Call the list_agents method
    agents = await agent_router.list_agents()

    # calling method
    agent_service.list_agents.assert_called_once()

    # Assert that the returned agents match the mock_agents
    assert agents == mock_agents

from backend.app.repositories.agent_repository import AgentRepository
from backend.app.services.agent_service import AgentService


# agent_repository = AgentRepository()
# agent_service = AgentService(agent_repository)

def get_agent_service() -> AgentService:
    agent_repository = AgentRepository()
    return AgentService(agent_repository)
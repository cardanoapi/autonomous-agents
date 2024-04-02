from backend.app.repositories.agent_repository import AgentRepository
from backend.app.repositories.trigger_repository import TriggerRepository
from backend.app.services.agent_service import AgentService
from backend.app.services.trigger_service import TriggerService


def get_agent_service() -> AgentService:
    agent_repository = AgentRepository()
    agent_service = AgentService(agent_repository)
    return agent_service


def get_trigger_service() -> TriggerService:
    trigger_repository = TriggerRepository()
    trigger_service = TriggerService(trigger_repository)
    return trigger_service

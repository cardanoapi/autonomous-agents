from backend.app.repositories.agent_repository import AgentRepository
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.repositories.template_trigger_repository import TemplateTriggerRepository
from backend.app.repositories.trigger_repository import TriggerRepository
from backend.app.services.agent_service import AgentService
from backend.app.services.template_service import TemplateService
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.app.services.trigger_service import TriggerService


def get_agent_service() -> AgentService:
    agent_repository = AgentRepository()
    template_trigger_service = get_template_trigger_service()
    trigger_service = get_trigger_service()
    agent_service = AgentService(agent_repository, template_trigger_service, trigger_service)
    return agent_service


def get_trigger_service() -> TriggerService:
    trigger_repository = TriggerRepository()
    trigger_service = TriggerService(trigger_repository)
    return trigger_service


def get_template_trigger_service() -> TemplateTriggerService:
    template_trigger_repository = TemplateTriggerRepository()
    template_trigger_service = TemplateTriggerService(template_trigger_repository)
    return template_trigger_service


def get_template_service() -> TemplateService:
    template_repository = TemplateRepository()
    template_trigger_service = get_template_trigger_service()
    template_service = TemplateService(template_repository, template_trigger_service)
    return template_service

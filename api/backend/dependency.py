from backend.app.repositories.agent_repository import AgentRepository
from backend.app.repositories.function_repository import AgentFunctionDetailRepository
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.repositories.template_trigger_repository import (
    TemplateTriggerRepository,
)
from backend.app.repositories.trigger_history_repository import TriggerHistoryRepository
from backend.app.repositories.trigger_repository import TriggerRepository
from backend.app.services.agent_service import AgentService
from backend.app.services.function_services import AgentFunctionDetailService
from backend.app.services.template_service import TemplateService
from backend.app.services.template_trigger_service import TemplateTriggerService
from backend.app.services.trigger_history_service import TriggerHistoryService
from backend.app.services.trigger_service import TriggerService
from backend.app.services.kafka_service import KafkaService

# Repository
agent_repository = AgentRepository()
trigger_repository = TriggerRepository()
template_trigger_repository = TemplateTriggerRepository()
template_repository = TemplateRepository()
trigger_history_repository = TriggerHistoryRepository()
function_repository = AgentFunctionDetailRepository()


# Services
kafka_service = KafkaService()
template_trigger_service = TemplateTriggerService(template_trigger_repository)
trigger_service = TriggerService(trigger_repository, kafka_service=kafka_service)
template_service = TemplateService(template_repository, template_trigger_service)
agent_service = AgentService(agent_repository, template_trigger_service, trigger_service)
trigger_history_service = TriggerHistoryService(trigger_history_repo=trigger_history_repository)
function_service = AgentFunctionDetailService(function_repo=function_repository)

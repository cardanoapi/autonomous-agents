from models.template_trigger.template_trigger_dto import TemplateTriggerCreateDto
from models.trigger.trigger_dto import (
    CronTriggerDTO,
    SubParameter,
    Action,
    TriggerCreateDTO,
)
from models.template_trigger.response_dto import TemplateTriggerResponse
from models.agent.agent_dto import TriggerResponse

demoParameters = [
    SubParameter(name="receiver_address", value="1111111111111111111111111111111111"),
    SubParameter(name="receiving_ada", value="10"),
]

demoAction = Action(function_name="Transfer Ada", parameters=demoParameters)

demoCronTrigger = CronTriggerDTO(frequency="* * * * *", probability=0.3)


def generate_demo_transfer_ada_trgger_response_fromat(
    template_id: str, description: str = ""
) -> TemplateTriggerResponse:
    return TemplateTriggerResponse(
        id="",
        template_id=template_id,
        description=description,
        type="CRON",
        action=demoAction,
        data=demoCronTrigger,
    )


def generate_demo_transfer_ada_trigger_format(agent_id: str) -> TriggerResponse:
    return TriggerResponse(
        id="", agent_id=agent_id, type="CRON", action=demoAction, data=demoCronTrigger
    )

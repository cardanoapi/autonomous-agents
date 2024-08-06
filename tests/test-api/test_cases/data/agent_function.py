from models.template_trigger.template_trigger_dto import TemplateTriggerCreateDto
from models.trigger.trigger_dto import (
    CronTriggerDTO,
    SubParameter,
    Action,
    TriggerCreateDTO,
)
from models.template_trigger.response_dto import TemplateTriggerResponse

demoParameters = [
    SubParameter(name="reciever_address", value="1111111111111111111111111111111111"),
    SubParameter(name="recieving_ada", value="10"),
]

demoAction = Action(function_name="transferADA", parameters=demoParameters)

demoCronTrigger = CronTriggerDTO(frequency="* * * * *", probability=0.3)


def generateDemoTransferAda(
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

from models.template_trigger.template_trigger_dto import TemplateTriggerCreateDto
from models.trigger.trigger_dto import (
    CronTriggerDTO,
    SubParameter,
    Action,
    TriggerCreateDTO,
    EventTriggerDTO,
)
from models.template_trigger.response_dto import TemplateTriggerResponse
from models.agent.agent_dto import TriggerResponse
import os
from models.agent.function import AgentFunction, ActionParameters

demoParameters = [
    SubParameter(name="receiver_address", value="1111111111111111111111111111111111"),
    SubParameter(name="receiving_ada", value="10"),
]

demoAction = Action(function_name="transferADA", parameters=demoParameters)

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


def transfer_ada_cron_function(
    agent_id: str, reciever_address: str, value: int, probability: float
) -> TriggerResponse:
    trigger_parameters = [
        SubParameter(name="receiver_address", value=reciever_address),
        SubParameter(name="receiving_ada", value=str(value)),
    ]
    trigger_action = Action(function_name="transferADA", parameters=trigger_parameters)
    trigger_data = CronTriggerDTO(frequency="* * * * *", probability=probability)
    return TriggerResponse(
        id="", agent_id=agent_id, type="CRON", action=trigger_action, data=trigger_data
    )


def vote_event_function(agent_id) -> TriggerResponse:
    trigger_action = Action(function_name="voteOnProposal", parameters=[])
    trigger_data = EventTriggerDTO(event="VoteEvent", parameters=[])
    return TriggerResponse(
        id="", agent_id=agent_id, type="EVENT", action=trigger_action, data=trigger_data
    )


def info_action_manual_trigger():
    url = ActionParameters(name="url", value="agents.cardanoapi.io")
    data_hash = ActionParameters(
        name="dataHash",
        value="1111111111111111111111111111111111111111111111111111111111111111",
    )
    trigger_param = ActionParameters(name="anchor", value=[url, data_hash])
    trigger = AgentFunction(
        function_name="createInfoGovAction", parameters=[trigger_param]
    )
    return trigger

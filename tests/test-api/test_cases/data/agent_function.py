from models.trigger.trigger_dto import (
    CronTriggerDTO,
    SubParameter,
    Action,
    EventTriggerDTO,
)
from models.template_trigger.response_dto import TemplateTriggerResponse
from models.agent.agent_dto import TriggerResponse
from models.agent.function import (
    AgentFunction,
    ActionParameters,
    InfoActionParameters,
    ValueModel,
)
from utils.logger import logger

# Default values used across functions
DEFAULT_FREQUENCY = "* * * * *"
DEFAULT_PROBABILITY = 0.3
DEFAULT_RECEIVER_ADDRESS = "1111111111111111111111111111111111"
DEFAULT_RECEIVING_ADA = "10"
DEFAULT_URL = "agents.cardanoapi.io"
DEFAULT_DATA_HASH = "1111111111111111111111111111111111111111111111111111111111111111"


# Predefined parameters and actions
demo_parameters = [
    SubParameter(name="receiver_address", value=DEFAULT_RECEIVER_ADDRESS),
    SubParameter(name="receiving_ada", value=DEFAULT_RECEIVING_ADA),
]

demo_action = Action(function_name="transferADA", parameters=demo_parameters)
demo_cron_trigger = CronTriggerDTO(
    frequency=DEFAULT_FREQUENCY, probability=DEFAULT_PROBABILITY
)


def generate_demo_transfer_ada_trigger_response_fromat(
    template_id: str, description: str = ""
) -> TemplateTriggerResponse:
    """
    Generates a demo TemplateTriggerResponse object for a CRON-based ADA transfer.
    """
    return TemplateTriggerResponse(
        id="",
        template_id=template_id,
        description=description,
        type="CRON",
        action=demo_action,
        data=demo_cron_trigger,
    )


def generate_demo_transfer_ada_trigger_format(agent_id: str) -> TriggerResponse:
    """
    Generates a demo TriggerResponse object for a CRON-based ADA transfer.
    """
    return TriggerResponse(
        id="",
        agent_id=agent_id,
        type="CRON",
        action=demo_action,
        data=demo_cron_trigger,
    )


def transfer_ada_cron_function(
    agent_id: str, reciever_address: str, value: int, probability: float
) -> TriggerResponse:
    """
    Creates a TriggerResponse for transferring ADA via a CRON trigger.
    """
    trigger_parameters = [
        SubParameter(name="receiver_address", value=reciever_address),
        SubParameter(name="receiving_ada", value=str(value)),
    ]
    trigger_action = Action(function_name="transferADA", parameters=trigger_parameters)
    trigger_data = CronTriggerDTO(frequency=DEFAULT_FREQUENCY, probability=probability)

    return TriggerResponse(
        id="",
        agent_id=agent_id,
        type="CRON",
        action=trigger_action,
        data=trigger_data,
    )


def vote_event_function(agent_id: str) -> TriggerResponse:
    """
    Creates a TriggerResponse for a vote event.
    """
    trigger_action = Action(function_name="voteOnProposal", parameters=[])
    trigger_data = EventTriggerDTO(event="VoteEvent", parameters=[])

    return TriggerResponse(
        id="",
        agent_id=agent_id,
        type="EVENT",
        action=trigger_action,
        data=trigger_data,
    )


def info_action_manual_trigger() -> AgentFunction:
    """
    Creates an AgentFunction for a manual info action trigger.
    """
    # Create the ValueModel with url and dataHash
    value_model = ValueModel(url=DEFAULT_URL, dataHash=DEFAULT_DATA_HASH)

    # Use the value_model as the value for InfoActionParameters
    trigger_param = InfoActionParameters(name="anchor", value=value_model)

    final_obj = AgentFunction(
        function_name="createInfoGovAction", parameters=[trigger_param]
    )

    logger.critical(final_obj)
    logger.critical("final obj")

    print(final_obj)

    return final_obj

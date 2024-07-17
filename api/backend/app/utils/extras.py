from backend.app.models.template import template_dto
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.repositories.agent_repository import AgentRepository
from backend.config.database import prisma_connection
from backend.app.models.template.template_dto import TemplateCreateDto
from backend.app.models.agent.agent_dto import AgentCreateDTO


def calculate_change_rate(old_value, new_value):
    if old_value == 0:
        return 100 if new_value > 0 else 0
    change_rate = ((new_value - old_value) / old_value) * 100
    return round(change_rate, 2)


async def create_empty_agent_for_user(userAddress: str):

    template_repository = TemplateRepository()
    agent_repository = AgentRepository()

    empty_template_data = TemplateCreateDto(
        userAddress=userAddress, name="Empty Template", description="Auto Generated Template", template_triggers=[]
    )

    async with prisma_connection.prisma.tx() as transaction:
        empty_template = await template_repository.save_template(
            transaction=transaction, template_data=empty_template_data
        )

    empty_agent_data = AgentCreateDTO(
        userAddress=userAddress, name="Empty Agent", template_id=empty_template["id"], instance=1
    )
    await agent_repository.save_agent(empty_agent_data)

import json

from backend.config.database import prisma_connection


async def check_if_agent_exists_in_db(agent_id: str):
    async with prisma_connection:
        agent_exists = await prisma_connection.prisma.agent.find_first(where={"id": agent_id, "deleted_at": None})
    return bool(agent_exists)


async def fetch_agent_configuration(agent_id):
    try:
        async with prisma_connection:
            agent_instance = await prisma_connection.prisma.agent.find_first(where={"id": agent_id, "deleted_at": None})

            agent_configurations = await prisma_connection.prisma.trigger.find_many(
                where={"agent_id": agent_id, "deleted_at": None}
            )

        instance_count = agent_instance.instance if agent_instance else None

        configurations_data = []
        for config in agent_configurations:
            try:
                configuration = {
                    "id": config.id,
                    "type": config.type,
                    "data": config.data,
                    "action": config.action,
                }
            except json.JSONDecodeError:
                print(f"Error decoding JSON for config id {config.id}: {config.data}")
                continue

            configurations_data.append(configuration)

        return instance_count, configurations_data
    except Exception as e:
        print(f"Error fetching agent configuration: {e}")
        return

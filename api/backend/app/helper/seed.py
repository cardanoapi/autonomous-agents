import asyncio

from backend.app.utils.generator import generate_random_base64
from backend.config.database import prisma_connection


async def seed_data():
    try:
        await prisma_connection.connect()
        items = await prisma_connection.prisma.agent.find_many(where={"deleted_at": None})
        for item in items:
            await prisma_connection.prisma.agent.update(
                where={"id": item.id}, data={"secret_key": generate_random_base64(32)}
            )
        print("Successful")
        await prisma_connection.disconnect()
    except Exception as err:
        print("Error occured ", err)


if __name__ == "__main__":
    asyncio.run(seed_data())

import asyncio

from backend.app.utils.base64 import generate_random_base64
from backend.config.database import prisma_connection


async def seed_data():
    try:
        await prisma_connection.connect()
        a = await prisma_connection.prisma.agent.find_many(where={"deleted_at": None})
        for i in a:
            await prisma_connection.prisma.agent.update(
                where={"id": i.id}, data={"secret_key": generate_random_base64(32)}
            )
        print("Successful", a)
    except Exception as err:
        print("Error occured ", err)


if __name__ == "__main__":
    asyncio.run(seed_data())

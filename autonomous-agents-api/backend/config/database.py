from prisma import Prisma
import logging


class PrismaConnection:
    def __init__(self):
        self.prisma = Prisma()
        self.connected = False

    async def connect(self):
        try:
            await self.prisma.connect()
            self.connected = True
            logging.info("Database connected")
        except Exception as e:
            logging.critical(f"Error Connecting to Database: {e}")
            raise

    async def disconnect(self):
        await self.prisma.disconnect()
        self.connected = False
        logging.info("Database Disconnected")


# Create a singleton instance of the PrismaConnection class
prisma_connection = PrismaConnection()

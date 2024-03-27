from prisma import Prisma
import logging
from backend.config.logger import logger

class PrismaConnection:

    def __init__(self):
        self.prisma = Prisma()
    
    async def connect(self):
        try :
         await self.prisma.connect()
         logger.info('Database connected Successfully')
        except:
         logging.critical('Error Connecting to Databse')
    
    async def disconnect(self):
        await self.prisma.disconnect()
        logging.info('Datbase Disconnected')

prisma_connection = PrismaConnection()
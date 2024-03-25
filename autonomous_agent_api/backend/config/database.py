from prisma import Prisma
import logging

class PrismaConnection:

    def __init__(self):
        self.prisma = Prisma()
    
    async def connect(self):
        try :
         await self.prisma.connect()
         logging.info('Database connected')
        except:
         logging.critical('Error Connecting to Databse')
    
    async def disconnect(self):
        await self.prisma.disconnect()
        logging.info('Datbase Disconnected')

prisma_connection = PrismaConnection()
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');

  console.log('Disconnecting Prisma Client');
  await prisma.$disconnect();
});

export const disconnectPrisma = async () => {
    await prisma.$disconnect();
};

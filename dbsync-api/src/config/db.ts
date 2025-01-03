import apm from "elastic-apm-node";
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();


if(process.env.ELASTIC_APM_SERVER_URL && process.env.ELASTIC_APM_API_KEY){
  prisma.$use(async (params: any, next:any) => {
    const spanName=params.model?`prisma.${params.model}.${params.action}`:`prisma.${params.action}`
    const span = apm.startSpan(spanName);
    if (span) {
      span.type = "DB";
      span.subtype = "prisma";
      span.action = "query";
    }
    try {
      const result = await next(params);
      span?.end();
      return result;
    } catch (e) {
      span?.end();
      throw e;
    }
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');

  console.log('Disconnecting Prisma Client');
  await prisma.$disconnect();
});

export const disconnectPrisma = async () => {
    await prisma.$disconnect();
};

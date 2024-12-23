import { PrismaClient } from "@prisma/client";
import { apm } from "../config/tracer";

export const prisma = new PrismaClient()

if(process.env.ELASTIC_APM_SERVER_URL && process.env.ELASTIC_APM_API_KEY){
  prisma.$use(async (params, next) => {
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
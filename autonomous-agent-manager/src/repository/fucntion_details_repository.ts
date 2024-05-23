// src/repository/function_detail_repository.ts
import { PrismaClient } from '@prisma/client';
import {v4 as uuidv4} from "uuid";
import {DateTime} from "luxon";

const prisma = new PrismaClient();

export const getFunctionDetail = async (name: string) => {
  return await prisma.functionDetail.findUnique({
    where: { name },
  });
};
export const createOrUpdateFunctionDetail = async (
  functionName: string,
  running: boolean
): Promise<void> => {
  await prisma.functionDetail.upsert({
    where: { name: functionName },
    update: {
      running: running,
      totalTransactions: {
        increment: 1,
      },
    },
    create: {
      id: uuidv4(),
      name: functionName,
      running: running,
      totalTransactions: 1,
    },
  });
};


export const updateFunctionRunningStatus = async (name: string, running: boolean):  Promise<void> => {
 await prisma.functionDetail.update({
    where: { name: name },
    data: { running:running },
  });
};

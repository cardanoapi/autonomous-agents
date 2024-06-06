import { PrismaClient, TriggerHistory } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
const prisma = new PrismaClient();


export async function saveTriggerHistory( agentId: string,
  functionName: string,
  status: boolean,
  success: boolean,
  message: string): Promise<void> {
        try {
           const triggerHistory: any = { };
            triggerHistory["id"] = uuidv4()
            triggerHistory["agentId"] = agentId
            triggerHistory["functionName"] = functionName
            triggerHistory["status"] = status
            triggerHistory["success"] = success
            triggerHistory["message"] = message
            triggerHistory["timestamp"] = DateTime.utc().toISO();

              await prisma.triggerHistory.create({
            data: triggerHistory,
        });
        } catch (error) {
            console.log(`Error : ${error}`);
        }

    }
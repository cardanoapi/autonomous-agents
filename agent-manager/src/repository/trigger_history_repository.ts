import { PrismaClient } from '@prisma/client'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export async function saveTriggerHistory(
    agentId: string,
    functionName: string,
    status: boolean,
    success: boolean,
    message: string,
    txHash?: string
): Promise<void> {
    try {
        const triggerHistory: any = {}
        triggerHistory['id'] = uuidv4()
        triggerHistory['agentId'] = agentId
        triggerHistory['functionName'] = functionName
        triggerHistory['status'] = status
        triggerHistory['success'] = success
        triggerHistory['message'] = message
        triggerHistory['timestamp'] = DateTime.utc().toISO()
        if (txHash) {
            triggerHistory['txHash'] = txHash
        }
        await prisma.triggerHistory.create({
            data: triggerHistory,
        })
    } catch (error) {
        console.log(`Error : ${error}`)
    }
}

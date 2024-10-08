import { PrismaClient } from '@prisma/client'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export type TriggerType = 'CRON' | 'MANUAL' | 'EVENT' | 'INTERNAL'

export async function saveTriggerHistory(
    agentSecretKey: string,
    functionName: string,
    status: boolean,
    success: boolean,
    message: string,
    triggerType: TriggerType,
    txHash?: string,
    instanceIndex: number = 0
): Promise<void> {
    try {
        const agent = await prisma.agent.findFirst({
            where: { secret_key: Buffer.from(agentSecretKey) },
        })
        const triggerHistory: any = {}
        triggerHistory['id'] = uuidv4()
        triggerHistory['agentId'] = agent!.id
        triggerHistory['functionName'] = functionName
        triggerHistory['status'] = status
        triggerHistory['success'] = success
        triggerHistory['message'] = message
        triggerHistory['timestamp'] = DateTime.utc().toISO()
        triggerHistory['triggerType'] = triggerType
        triggerHistory['instanceIndex'] = instanceIndex
        if (txHash) {
            triggerHistory['txHash'] = txHash
        }
        await prisma.triggerHistory.create({
            data: triggerHistory,
        })
    } catch (error) {
        console.log('TriggerHistoryError', error)
        throw error
    }
}

export async function updateAgentDrepRegistration(agentSecretKey: string, drepRegistered: boolean) {
    try {
        await prisma.agent.updateMany({
            where: { secret_key: Buffer.from(agentSecretKey) },
            data: {
                is_drep_registered: drepRegistered,
            },
        })
    } catch (err) {
        console.log('AgentDrepStatusUpdateError', err)
        throw err
    }
}

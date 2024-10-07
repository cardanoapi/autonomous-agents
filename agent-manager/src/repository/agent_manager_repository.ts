import { JsonValue } from '@prisma/client/runtime/library'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function checkIfAgentExistsInDB(agentSecretKey: string): Promise<boolean> {
    return prisma.agent
        .findFirst({
            where: {
                secret_key: Buffer.from(agentSecretKey),
                deleted_at: null,
            },
        })
        .then((agents: any) => {
            return !!agents
        })
        .catch((error: any) => {
            console.error('checkIfAgentExistsInDB: Unknown error', error)
            return false
        })
}

export async function fetchAgentConfiguration(agentSecretKey: string): Promise<{
    instanceCount: number | null
    configurations: any[]
    agentIndex: number | null
    agentName: string | null
}> {
    try {
        const agent = await prisma.agent.findFirst({
            include: {
                triggers: {
                    where: {
                        deleted_at: null,
                    },
                },
            },
            where: {
                secret_key: Buffer.from(agentSecretKey),
                deleted_at: null,
            },
        })
        if (agent != null) {
            const instanceCount = Number(agent.instance)
            const agentIndex = Number(agent.index)
            const agentName = agent.name
            const configurationsData =
                agent.triggers.map((config: { id: string; type: string; data: JsonValue; action: JsonValue }) => ({
                    id: config.id,
                    type: config.type,
                    data: config.data,
                    action: config.action,
                })) || []
            return { instanceCount, configurations: configurationsData, agentIndex, agentName }
        } else {
            return { instanceCount: null, configurations: [], agentIndex: null, agentName: null }
        }
    } catch (error: any) {
        console.log(`Error fetching agent configuration: ${error}`)
        throw error
    }
}

export async function updateLastActiveTimestamp(agentSecretKey: string): Promise<void> {
    try {
        await prisma.agent.updateMany({
            where: {
                secret_key: Buffer.from(agentSecretKey),
            },
            data: { last_active: new Date() },
        })
    } catch (error: any) {
        console.error(`Error updating last active timestamp for agent with secret key ${agentSecretKey}: ${error}`)
    }
}

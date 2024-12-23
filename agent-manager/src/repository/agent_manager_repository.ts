import { JsonValue } from '@prisma/client/runtime/library'
import { prisma } from "./dbClient";


export async function getAgentIdBySecret(agentSecret: Buffer): Promise<string | null> {
    return prisma.agent
        .findFirst({
            where: {
                secret_key: agentSecret,
                deleted_at: null,
            },
        })
        .then((agents: any) => {
            return agents ? agents.id : null
        })
        .catch((error: any) => {
            console.error('checkIfAgentExistsInDB: Unknown error', error)
            return false
        })
}

export async function fetchAgentConfiguration(agentId: string): Promise<
    | {
          instanceCount: number
          configurations: any[]
          agentIndex: number
          agentName: string
      }
    | undefined
> {
    try {
        const [agentInstance, agentConfigurations] = await Promise.all([
            prisma.agent.findFirst({
                where: {
                    id: agentId,
                    deleted_at: null,
                },
            }),
            prisma.trigger.findMany({
                where: {
                    agent_id: agentId,
                    deleted_at: null,
                },
            }),
        ])
        if (agentInstance != null) {
            const instanceCount = Number(agentInstance.instance)
            const agentIndex = Number(agentInstance.index)
            const agentName = agentInstance.name
            const configurationsData = agentConfigurations.map(
                (config: { id: string; type: string; data: JsonValue; action: JsonValue }) => ({
                    id: config.id,
                    type: config.type,
                    data: config.data,
                    action: config.action,
                })
            )

            return { instanceCount, configurations: configurationsData, agentIndex, agentName }
        }
    } catch (error: any) {
        console.log(`Error fetching agent configuration: ${error}`)
        throw error
    }
}

export async function updateLastActiveTimestamp(agentId: string): Promise<void> {
    try {
        await prisma.agent.update({
            where: { id: agentId },
            data: { last_active: new Date() },
        })
    } catch (error: any) {
        console.error(`Error updating last active timestamp for agent ${agentId}: ${error}`)
    }
}

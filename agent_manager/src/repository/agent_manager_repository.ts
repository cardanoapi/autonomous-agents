import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function checkIfAgentExistsInDB(agentId: string): Promise<boolean> {
    try {
        const agents = await prisma.agent.findFirst({
            where: {
                id: agentId,
                deleted_at: null
            }
        });
        return !!agents;
    } catch (error) {
        console.log(`Error checking if agent exists in database: ${error}`);
        return false;
    }
}

export async function fetchAgentConfiguration(agentId: string): Promise<{ instanceCount: number | null; configurations: any[] }> {
    try {
        const agentInstance = await prisma.agent.findFirst({
            where: {
                id: agentId,
                deleted_at: null
            }
        });

        const agentConfigurations = await prisma.trigger.findMany({
            where: {
                agent_id: agentId,
                deleted_at: null
            }
        });

        const instanceCount = agentInstance ? agentInstance.instance : null;

        const configurationsData = agentConfigurations.map((config: { id: string, type: string, data: string, action: string })=> ({
            id: config.id,
            type: config.type,
            data: config.data,
            action: config.action
        }));

        return { instanceCount, configurations: configurationsData };
    } catch (error) {
        console.log(`Error fetching agent configuration: ${error}`);
        return { instanceCount: null, configurations: [] };
    }
}


export async function updateLastActiveTimestamp(agentId: string): Promise<void> {
    try {
        await prisma.agent.update({
            where: {id: agentId},
            data: {last_active: new Date()},
        });
    } catch (error) {
        console.log(`Error updating last active timestamp for agent ${agentId}: ${error}`);
    }
}

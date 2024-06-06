import { PrismaClient } from '@prisma/client';
import {JsonValue} from "@prisma/client/runtime/library";


const prisma = new PrismaClient();

export async function checkIfAgentExistsInDB(agentId: string): Promise<boolean> {
    return prisma.agent.findFirst({
        where: {
            id: agentId,
            deleted_at: null
        }
    })
        .then(agents => {

            return !!agents;
        })
}


    export async function fetchAgentConfiguration(agentId: string): Promise<{
        instanceCount: number | null;
        configurations: any[]
    }> {
        try {
            const [agentInstance, agentConfigurations] = await Promise.all([
                prisma.agent.findFirst({
                    where: {
                        id: agentId,
                        deleted_at: null
                    }
                }),
                prisma.trigger.findMany({
                    where: {
                        agent_id: agentId,
                        deleted_at: null
                    }
                })
            ]);
            if (agentInstance != null) {
                const instanceCount = Number(agentInstance.instance);
                const configurationsData = agentConfigurations.map((config: {
                    id: string,
                    type: string,
                    data: JsonValue,
                    action: JsonValue
                }) => ({
                    id: config.id,
                    type: config.type,
                    data: config.data,
                    action: config.action,

                }));

                return {instanceCount, configurations: configurationsData};
            } else {
                return {instanceCount: null, configurations: []};
            }

        } catch (error) {
            console.log(`Error fetching agent configuration: ${error}`);
            return {instanceCount: null, configurations: []};
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




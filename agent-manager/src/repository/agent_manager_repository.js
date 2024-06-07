"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLastActiveTimestamp = exports.fetchAgentConfiguration = exports.checkIfAgentExistsInDB = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkIfAgentExistsInDB(agentId) {
    return prisma.agent.findFirst({
        where: {
            id: agentId,
            deleted_at: null
        }
    })
        .then(agents => {
        return !!agents;
    });
}
exports.checkIfAgentExistsInDB = checkIfAgentExistsInDB;
async function fetchAgentConfiguration(agentId) {
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
            const configurationsData = agentConfigurations.map((config) => ({
                id: config.id,
                type: config.type,
                data: config.data,
                action: config.action,
            }));
            return { instanceCount, configurations: configurationsData };
        }
        else {
            return { instanceCount: null, configurations: [] };
        }
    }
    catch (error) {
        console.log(`Error fetching agent configuration: ${error}`);
        return { instanceCount: null, configurations: [] };
    }
}
exports.fetchAgentConfiguration = fetchAgentConfiguration;
async function updateLastActiveTimestamp(agentId) {
    try {
        await prisma.agent.update({
            where: { id: agentId },
            data: { last_active: new Date() },
        });
    }
    catch (error) {
        console.log(`Error updating last active timestamp for agent ${agentId}: ${error}`);
    }
}
exports.updateLastActiveTimestamp = updateLastActiveTimestamp;

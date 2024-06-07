import { z } from 'zod';

export const agentFormSchema = z.object({
    agentName: z.string(),
    agentTemplate: z.string(),
    numberOfAgents: z.number().min(1)
});

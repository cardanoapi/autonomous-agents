import { z } from 'zod';

export const templateFormSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    triggers: z.any()
});

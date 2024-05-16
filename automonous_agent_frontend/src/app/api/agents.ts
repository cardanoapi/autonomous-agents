'use client';

import axios from 'axios';
import { z } from 'zod';

import { agentFormSchema } from '../(pages)/agents/create-agent/page';
import { baseAPIurl } from './config';

export interface IAgent {
    id: string;
    name: string;
    template_id: string;
    instance: number;
    index: number;
    last_active: string;
    active: boolean | null;
}

export const fetchAgents = async (): Promise<IAgent[]> => {
    const res = await fetch(`${baseAPIurl}/agents/`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const fetchActiveAgentsCount = async () => {
    const res = await fetch(`${baseAPIurl}/agents/online/`);
    if (!res.ok) {
        throw new Error('Active Agents Fetch Opetation failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const postAgentData = async (formData: z.infer<typeof agentFormSchema>) => {
    const data = {};
    const response = await fetch(`${baseAPIurl}/agents/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: formData.agentName,
            template_id: formData.agentTemplate,
            instance: formData.numberOfAgents
        })
    });
    if (!response.ok) {
        throw new Error('Failed to create new Agent');
    }
    return await response.json()
};

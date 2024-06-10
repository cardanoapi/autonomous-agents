'use client';

import axios from 'axios';
import { z } from 'zod';

import { agentFormSchema } from '../(pages)/agents/create-agent/_form/schema';
import { baseAPIurl } from './config';

export interface IAgent {
    id: string;
    name: string;
    template_id: string;
    instance: number;
    index: number;
    last_active: string;
}

export const fetchAgents = async (): Promise<IAgent[]> => {
    const res = await fetch(`${baseAPIurl}/agents`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const fetchActiveAgentsCount = async () => {
    const res = await fetch(`${baseAPIurl}/agents/online`);
    if (!res.ok) {
        throw new Error('Active Agents Fetch Opetation failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const postAgentData = async (formData: z.infer<typeof agentFormSchema>) => {
    try {
        const response = await axios.post(
            `${baseAPIurl}/agents`,
            {
                name: formData.agentName,
                template_id: formData.agentTemplate,
                instance: formData.numberOfAgents
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error posting agent data:', error);
        throw error;
    }
};

export const deleteAgentbyID = async (agentID: string) => {
    try {
        const response = await axios.delete(`${baseAPIurl}/agents/${agentID}`);
        if (response.status === 204) {
            return { success: true, agentID };
        } else {
            throw new Error('Template deletion failed: Unexpected status code');
        }
    } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
    }
};

export const fetchAgentbyID = async (agentID: string): Promise<IAgent> => {
    const url = `${baseAPIurl}/agent/${agentID}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error('Agent Fetch Operation failed: Network Error');
    }
};

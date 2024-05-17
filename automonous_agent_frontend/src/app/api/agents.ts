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
    try {
        const response = await axios.post(`${baseAPIurl}/agents`, {
            name: formData.agentName,
            template_id: formData.agentTemplate,
            instance: formData.numberOfAgents,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response)
        return response.data;
    } catch (error) {
        console.error('Error posting agent data:', error);
        throw error; 
    }
};



export const deleteAgentbyID = async (agentID : string ) => {
    const response = await fetch(`${baseAPIurl}/agents/${agentID}` , {
        method : 'DELETE',
    })
    if (!response.ok) {
        throw new Error(`Failed to Delet Agent with the ID ${agentID}`);
    }
    if (response.status === 204){
        return true
    }
}
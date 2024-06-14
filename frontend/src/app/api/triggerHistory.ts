import { baseAPIurl } from './config';

export interface IAgentTriggerHistory {
    id: string;
    agentId: string;
    functionName: string;
    status: boolean;
    success: boolean;
    message: string;
    timestamp: string;
}

export const fetchAgentTriggerHistoryById = async (agentId: string) => {
    const res = await fetch(`${baseAPIurl}/trigger-history/${agentId}/agent`);
    if (!res.ok) {
        throw new Error('Trigger Fetch failed: Network Error');
    }
    return await res.json();
};

export const fetchTransactionCountOfAgentById = async (agentId: string) => {
    const res = await fetch(`${baseAPIurl}/transaction-counts/${agentId}/agent`);
    if (!res.ok) {
        throw new Error('Trigger Fetch failed: Network Error');
    }
    return await res.json();
};

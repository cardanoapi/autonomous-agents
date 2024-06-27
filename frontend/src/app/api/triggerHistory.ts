import { QueryFunctionContext } from '@tanstack/react-query';

import { baseAPIurl } from './config';

export interface IAgentTriggerHistory {
    id: string;
    agentId: string;
    functionName: string;
    status: boolean;
    success: boolean;
    message: string;
    timestamp: string;
    triggerType: string;
    txHash: string;
}

export const fetchAgentTriggerHistoryById = async (
    agentId: string,
    pageItemsSize: number
) => {
    const res = await fetch(
        `${baseAPIurl}/trigger-history?agent_id=${agentId}&size=${pageItemsSize}`
    );
    if (!res.ok) {
        throw new Error('Trigger Fetch failed: Network Error');
    }
    return await res.json();
};

export const fetchTransactionCountOfAgentById = async (agentId: string) => {
    const res = await fetch(`${baseAPIurl}/transaction-counts/${agentId}`);
    if (!res.ok) {
        throw new Error('Trigger Fetch failed: Network Error');
    }
    return await res.json();
};

export const fetchTriggerHistoryByFunctionName = async (functionName: string) => {
    const encodedFunctionName = encodeURI(functionName);
    const res = await fetch(
        `${baseAPIurl}/trigger-history?function_name=${encodedFunctionName}`
    );
    if (!res.ok) {
        throw new Error('Trigger Fetch Failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const fetchAllTriggerHistory = async ({
    queryKey
}: QueryFunctionContext<[string, number?, number?, string?]>) => {
    const [, page, size = 50, functionName] = queryKey;

    let fetchURL = `${baseAPIurl}/trigger-history?page=${page}&size=${size}`;

    if (functionName && functionName.length !== 0) {
        fetchURL += `&function_name=${functionName}`;
    }

    const res = await fetch(fetchURL);

    if (!res.ok) {
        throw new Error('Trigger Fetch Failed: Network Error');
    }
    const data = await res.json();

    return data;
};

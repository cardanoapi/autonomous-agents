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
}: QueryFunctionContext<
    [string, number?, number?, string?, string?, string?, string?]
>) => {
    const [, page, size = 50, agentID, functionName, status, success] = queryKey;

    let fetchURL = `${baseAPIurl}/trigger-history?page=${page}&size=${size}`;

    if (agentID && agentID !== 'None') {
        fetchURL += `&agent_id=${agentID}`;
    }

    if (functionName && functionName !== 'None') {
        fetchURL += `&function_name=${functionName}`;
    }
    if (status && status !== 'None') {
        fetchURL += `&status=${status}`;
    }
    if (success && success !== 'None') {
        fetchURL += `&success=${success}`;
    }

    const encodedURL = encodeURI(fetchURL);

    const res = await fetch(encodedURL);
    console.log(fetchURL);

    if (!res.ok) {
        throw new Error('Trigger Fetch Failed: Network Error');
    }
    const data = await res.json();
    return data;
};

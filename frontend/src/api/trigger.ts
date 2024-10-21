import axios from 'axios';

import {
    IAgentAction,
    IAgentConfiguration,
    ICronTrigger,
    IEventTrigger
} from './agents';
import { baseAPIurl } from './config';

export interface ITrigger {
    id: string;
    template_id: string;
    type: string;
    action: {
        function_name: string;
        parameter: { name: string; value: string }[];
    };
    data: {
        frequency: string;
        probability: number;
    };
}

interface ITransactionsResponseDto {
    total_transactions: string;
    successful_transactions: string;
    unsuccessful_transactions: string;
    skipped_transactions: string;
    unskipped_transactions: string;
}

export interface ITransactionsCount {
    totalTransactions: string;
    successfulTransactions: string;
    unSuccessfulTransactions: string;
    skippedTransactions: string;
    unSkippedTransactions: string;
}

export const fetchtriggersbyTemplateID = async (templateID: string) => {
    const res = await fetch(`${baseAPIurl}/templates/${templateID}/trigger`);
    if (!res.ok) {
        throw new Error('Trigger Fetch failed: Network Error');
    }
    return await res.json();
};

export const fetchTransactionsCountByAgentID = async (
    agentID: string
): Promise<ITransactionsCount> => {
    const res = await fetch(`${baseAPIurl}/transaction-counts/${agentID}`);
    if (!res.ok) {
        throw new Error('Trigger Fetch failed: Network Error');
    }
    const data: ITransactionsResponseDto = await res.json();
    return {
        totalTransactions: data.total_transactions,
        successfulTransactions: data.successful_transactions,
        unSuccessfulTransactions: data.unsuccessful_transactions,
        skippedTransactions: data.skipped_transactions,
        unSkippedTransactions: data.unskipped_transactions
    };
};

export const fetchTransactionsCount = async (): Promise<ITransactionsCount> => {
    const res = await fetch(`${baseAPIurl}/transaction-counts`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return {
        totalTransactions: data.total_transactions,
        successfulTransactions: data.successful_transactions,
        unSuccessfulTransactions: data.unsuccessful_transactions,
        skippedTransactions: data.skipped_transactions,
        unSkippedTransactions: data.unskipped_transactions
    };
};

export const fetchTriggers = async () => {
    const res = await fetch(`${baseAPIurl}/triggers`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export interface ITriggerCreateDto {
    type: string;
    action: IAgentAction;
    data: ICronTrigger | IEventTrigger;
}

export const postTrigger = async (agentID: string, triggerData: ITriggerCreateDto) => {
    const response = await axios.post(
        `${baseAPIurl}/agents/${agentID}/triggers`,
        triggerData,
        {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }
    );
    return response.data;
};

export const deleteTrigger = async (triggerID: string) => {
    const response = await axios.delete(`${baseAPIurl}/triggers/${triggerID}`, {
        withCredentials: true
    });
    return response.data;
};

export const updateTrigger = async (triggerData: IAgentConfiguration) => {
    console.log(triggerData);
    const response = await axios.put(
        `${baseAPIurl}/triggers/${triggerData.id}`,
        {
            type: triggerData.type,
            action: triggerData.action,
            data: triggerData.data
        },
        {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }
    );
    return response.data;
};

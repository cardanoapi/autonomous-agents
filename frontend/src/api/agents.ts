'use client';

import { AgentTriggerFunctionType } from '@models/types';
import axios from 'axios';
import { z } from 'zod';

import { convertToQueryStr } from '@app/utils/common/extra';

import { agentFormSchema } from '../app/(pages)/agents/create-agent/_form/schema';
import { baseAPIurl } from './config';

export type BooleanOperator = 'AND' | 'OR';
export type ComparisonOperator = 'equals' | 'greaterThan' | 'lessThan' | 'in';

export interface IFieldNode {
    id: string | Array<string>;
    value: any;
    negate: boolean;
    operators: string[];
    validator: (...args: any) => any;
}

export interface IBooleanNode {
    id?: string | string[];
    children: IFilterNode[];
    negate: boolean;
    operator: BooleanOperator;
}

export interface IEventTrigger {
    id: string | string[];
    children: IFilterNode[];
    negate: boolean;
    operator: BooleanOperator;
}

export type IFilterNode = IFieldNode | IBooleanNode;

export type TriggerType = 'CRON' | 'MANUAL' | 'EVENT';

export interface ISubParameter {
    name: string;
    value?: any;
}

export interface IAgentAction {
    function_name: string;
    parameters: Array<ISubParameter>;
}

export interface ICronTrigger {
    frequency: string;
    probability: number;
}

export interface IAgentConfiguration {
    id: string;
    agent_id: string;
    type: TriggerType;
    action: IAgentAction;
    data: ICronTrigger | IEventTrigger;
}

export interface IAgentUpdateReqDto {
    agentId?: string;
    agentName?: string;
    templateId?: string;
    agentConfigurations?: Array<IAgentConfiguration>;
    instance?: number;
}

export interface IDelegation {
    pool_id?: string;
    drep_id?: string;
}

export interface IAgent {
    id: string;
    name: string;
    template_id?: string;
    template_name?: string;
    instance: number;
    index: number;
    last_active: string;
    agent_address?: string;
    wallet_amount?: string;
    agent_configurations?: Array<IAgentConfiguration>;
    total_functions?: number;
    is_active?: boolean;
    userAddress?: string;
    drep_id?: string;
    delegated_drep_id?: string;
    voting_power?: number;
    is_drep_registered?: boolean;
    is_stake_registered?: boolean;
    delegation?: IDelegation;
    stake_last_registered?: string;
    no_of_successfull_triggers?: number;
    secret_key?: string;
}

export const fetchAgents = async (params: {
    page: number;
    size: number;
    search: string;
}): Promise<IAgent[]> => {
    const { page, size, search } = params;

    const queryString = convertToQueryStr(page, size, search);

    const res = await fetch(`${baseAPIurl}/agents?${queryString}`, {
        credentials: 'include'
    });
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    return await res.json();
};

export const fetchActiveAgentsCount = async () => {
    const res = await fetch(`${baseAPIurl}/agents/online`);
    if (!res.ok) {
        throw new Error('Active Agents Fetch Opetation failed: Network Error');
    }
    return await res.json();
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
                },
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error posting agent data:', error);
        throw error;
    }
};

export const updateAgentData = async (formData: IAgentUpdateReqDto) => {
    try {
        const response = await axios.put(
            `${baseAPIurl}/agents/${formData.agentId}`,
            {
                name: formData.agentName,
                template_id: formData.templateId,
                instance: formData.instance,
                agent_configurations: formData.agentConfigurations
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
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
        const response = await axios.delete(`${baseAPIurl}/agents/${agentID}`, {
            withCredentials: true
        });
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
        const response = await axios.get(url, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error('Agent Fetch Operation failed: Network Error');
    }
};

export interface AgentTriggerRequestData {
    function_name: AgentTriggerFunctionType;
    parameters: Array<any>;
}

export const manualTriggerForAgent = async (
    agentId: string,
    data: AgentTriggerRequestData
) => {
    const url = `${baseAPIurl}/agents/${agentId}/trigger`;
    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error posting agent data:', error);
        throw error;
    }
};

export const fetchMyAgent = async (): Promise<IAgent> => {
    const url = `${baseAPIurl}/agents/my-agent`;

    try {
        const response = await axios.get(url, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error('Agent Fetch Operation failed: Network Error');
    }
};

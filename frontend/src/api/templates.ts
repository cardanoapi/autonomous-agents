'use client';

import { IAgentAction, ICronTrigger, IEventTrigger } from '@api/agents';
import axios from 'axios';

import { convertToQueryStr } from '@app/utils/common/extra';

import { baseAPIurl } from './config';
import { ITriggerCreateDto } from './trigger';

type TriggerType = 'CRON' | 'MANUAL' | 'EVENT';

axios.interceptors.request.use((request) => {
    return request;
});

axios.interceptors.response.use((response) => {
    return response;
});

export interface ITemplateConfiguration {
    id: string;
    template_id: string;
    type: TriggerType;
    action: IAgentAction;
    data: ICronTrigger | IEventTrigger;
}

export interface ITemplate {
    id: string;
    name: string;
    description: string;
    template_configurations?: Array<ITemplateConfiguration>;
}

export interface ICreateTemplateRequestDTO {
    name: string;
    description: string;
    template_triggers: ITriggerCreateDto[];
}

export const fetchTemplates = async (params: { page: number; size: number; search: string }): Promise<ITemplate[]> => {
    const { page, size, search } = params;

    const queryString = convertToQueryStr(page, size, search);

    const res = await fetch(`${baseAPIurl}/templates?${queryString}`);
    if (!res.ok) {
        throw new Error('Templates Fetch Operation failed: Network Error');
    }
    return await res.json();
};

export const fetchTemplatebyID = async (templateID: string): Promise<ITemplate> => {
    const res = await fetch(`${baseAPIurl}/templates/${templateID}`);
    if (!res.ok) {
        throw new Error('Templates Fetch Operation failed: Network Error');
    }
    return await res.json();
};

export const postTemplateData = async ({ data }: { data: ICreateTemplateRequestDTO }) => {
    try {
        const response = await axios.post(
            `${baseAPIurl}/templates`,
            {
                name: data.name,
                description: data.description,
                template_triggers: data.template_triggers
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
        console.error('Error posting template data:', error);
        throw error;
    }
};

export const updateTemplateData = async (formData: ITemplate) => {
    try {
        const response = await axios.put(
            `${baseAPIurl}/templates/${formData.id}`,
            {
                name: formData.name,
                description: formData.description,
                template_configurations: formData.template_configurations
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
        console.error('Error updating Template data:', error);
        throw error;
    }
};

export const deleteTemplatebyID = async (templateID: string) => {
    try {
        const response = await axios.delete(`${baseAPIurl}/templates/${templateID}`, {
            withCredentials: true
        });
        if (response.status === 204) {
            return true;
        } else {
            throw new Error('Template deletion failed: Unexpected status code');
        }
    } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
    }
};

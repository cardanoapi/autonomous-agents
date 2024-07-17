'use client';

import { IAgentAction, ICronTrigger, IEventTrigger } from '@api/agents';
import axios from 'axios';
import { z } from 'zod';

import { templateFormSchema } from '../(pages)/templates/create-template/components/schema';
import { ITemplateOption } from '../(pages)/templates/create-template/page';
import { baseAPIurl } from './config';

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
    action?: IAgentAction;
    data?: ICronTrigger | IEventTrigger;
}

export interface ITemplate {
    id: string;
    name: string;
    description: string;
    template_configurations?: Array<ITemplateConfiguration>;
}

export const fetchTemplates = async (): Promise<ITemplate[]> => {
    const res = await fetch(`${baseAPIurl}/templates`);
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

export const postTemplateData = async (
    formData: z.infer<typeof templateFormSchema>
) => {
    const formatedTemplatedata = {
        name: formData.name,
        description: formData.description,
        template_triggers: formData.triggers.map((item: ITemplateOption) => ({
            type: item.type,
            action:
                item.type === 'CRON'
                    ? {
                          function_name: item.label,
                          parameters: item?.cronParameters?.map((param) => ({
                              name: param.name,
                              value: param.value
                          }))
                      }
                    : {
                          function_name: 'voteOnProposal',
                          parameters: []
                      },

            data:
                item.type === 'CRON'
                    ? {
                          frequency: item.cronExpression?.join(' '),
                          probability: item.probability
                      }
                    : {
                          event: 'VoteEvent',
                          parameters: []
                      }
        }))
    };

    try {
        const response = await axios.post(
            `${baseAPIurl}/templates`,
            formatedTemplatedata,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
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
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error posting agent data:', error);
        throw error;
    }
};

export const deleteTemplatebyID = async (templateID: string) => {
    try {
        const response = await axios.delete(`${baseAPIurl}/templates/${templateID}`);
        console.log(response);
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

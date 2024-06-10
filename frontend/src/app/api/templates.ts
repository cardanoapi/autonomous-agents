'use client';

import axios from 'axios';
import { z } from 'zod';

import { templateFormSchema } from '../(pages)/templates/create-template/components/schema';
import { ITemplateOption } from '../(pages)/templates/create-template/page';
import { baseAPIurl } from './config';

axios.interceptors.request.use((request) => {
    //console.log('Request data:', request);
    return request;
});

axios.interceptors.response.use((response) => {
    //console.log('Response data:', response);
    return response;
});

export interface ITemplate {
    id: string;
    name: string;
    description: string;
}

export const fetchTemplates = async (): Promise<ITemplate[]> => {
    const res = await fetch(`${baseAPIurl}/templates`);
    if (!res.ok) {
        throw new Error('Templates Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const fetchTemplatebyID = async (templateID: string): Promise<ITemplate> => {
    const res = await fetch(`${baseAPIurl}/templates/${templateID}`);
    if (!res.ok) {
        throw new Error('Templates Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const postTemplateData = async (
    formData: z.infer<typeof templateFormSchema>
) => {
    const formatedTemplatedata = {
        name: formData.name,
        description: formData.description,
        template_triggers: formData.triggers.map((item: ITemplateOption) => ({
            type: 'CRON',
            action: {
                function_name: item.label,
                parameter: item?.cronParameters?.map((param) => ({
                    name: param.name,
                    value: param.value
                }))
            },
            data: {
                frequency: item.cronExpression?.join(' '),
                probability: 1
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

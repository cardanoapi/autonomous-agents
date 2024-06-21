'use client';

import { useParams, useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';

import { IAgent, fetchAgentbyID } from '@app/app/api/agents';
import { ITemplate, fetchTemplates } from '@app/app/api/templates';
import AgentTabSection from '@app/components/Agent/AgentTab';
import AgentTabContent from '@app/components/Agent/AgentTabContent';

export default function AgentPageById() {
    const params = useParams();
    const router = useRouter();
    const agentID = params.agentID as string;

    const { data: agent, isLoading: agentLoading } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID)
    });
    const { data: templates = [] } = useQuery<ITemplate[]>({
        queryKey: ['templates'],
        queryFn: fetchTemplates
    });
    const agentTemplate = templates.find(
        (template) => template.id === agent?.template_id
    );
    return (
        <div className={'flex flex-col gap-4'}>
            <div
                onClick={() => router.push('/agents')}
                className={
                    'flex w-fit cursor-pointer items-center rounded py-1 pl-1 pr-2 hover:bg-gray-300'
                }
            >
                <ChevronLeft />
                <span className={'text-base text-brand-Black-300'}>Back</span>
            </div>
            <div className={'flex h-full min-h-[600px] w-full gap-4 '}>
                <AgentTabSection />
                <AgentTabContent
                    agent={agent}
                    agentTemplate={agentTemplate}
                    agentLoading={agentLoading}
                />
            </div>
        </div>
    );
}

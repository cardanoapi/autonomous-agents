'use client';

import { useEffect } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { IAgent, fetchAgentbyID } from '@app/app/api/agents';
import AgentTabSection from '@app/components/Agent/AgentTab';
import AgentTabContent from '@app/components/Agent/AgentTabContent';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@app/components/atoms/Breadcrumb';
import { currentAgentNameAtom, selectedAgentTabAtom } from '@app/store/localStore';

export default function AgentPageById() {
    const [, setCurrentAgentName] = useAtom(currentAgentNameAtom);
    const [selectedTab] = useAtom(selectedAgentTabAtom);
    useEffect(() => {
        setCurrentAgentName(agent?.name || '');
    });

    const params = useParams();
    const router = useRouter();
    const agentID = params.agentID as string;

    const { data: agent, isLoading: agentLoading } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID)
    });

    return (
        <div className={'flex flex-col gap-4'}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem
                        onClick={() => router.push('/agents')}
                        className="hover:cursor-pointer hover:text-brand-Blue-200"
                    >
                        Agents
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>Agent Profile</BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>{selectedTab}</BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className={'flex h-full min-h-[600px] w-full gap-4 '}>
                <AgentTabSection />
                <AgentTabContent agent={agent} agentLoading={agentLoading} />
            </div>
        </div>
    );
}

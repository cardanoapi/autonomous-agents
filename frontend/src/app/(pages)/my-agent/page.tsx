'use client';

import { useEffect } from 'react';

import { IAgent, fetchMyAgent } from '@api/agents';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import AgentTabSection from '@app/components/Agent/AgentTab';
import AgentTabContent from '@app/components/Agent/AgentTabContent';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@app/components/atoms/Breadcrumb';
import { walletApiAtom } from '@app/store/localStore';
import { currentAgentNameAtom } from '@app/store/localStore';
import { selectedAgentTabAtom } from '@app/store/localStore';

export default function MyAgentPage() {
    const { data: agent, isLoading: agentLoading } = useQuery<IAgent>({
        queryKey: [`myAgent`],
        queryFn: () => fetchMyAgent()
    });

    const [, setCurrentAgentName] = useAtom(currentAgentNameAtom);
    const [selectedTab] = useAtom(selectedAgentTabAtom);
    useEffect(() => {
        setCurrentAgentName(agent?.name || '');
    });

    const [walletApi] = useAtom(walletApiAtom);

    if (walletApi === null) {
        return (
            <div className="mt-[30%] flex h-full items-center justify-center text-brand-Gray-300">
                <div className="text-center">
                    <p>Active Wallet Connection Missing!</p>
                    <p>Please connect your Wallet . . .</p>
                </div>
            </div>
        );
    }
    return (
        <div className={'flex flex-col gap-4'}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>My Agent</BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>{selectedTab}</BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className={'flex h-full min-h-[600px] w-full gap-4 '}>
                <AgentTabSection enableEdit={true} />
                <AgentTabContent
                    agent={agent}
                    agentLoading={agentLoading}
                    enableEdit={true}
                />
            </div>
        </div>
    );
}

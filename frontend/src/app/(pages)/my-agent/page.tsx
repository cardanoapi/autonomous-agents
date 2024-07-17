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
            <div className="text-brand-Gray-300">
                Active Wallet Connection Missing! Please connect your Wallet.
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
                <AgentTabSection />
                <AgentTabContent agent={agent} agentLoading={agentLoading} />
            </div>
        </div>
    );
}

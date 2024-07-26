'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { IAgent, fetchMyAgent } from '@api/agents';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import Cookies from 'js-cookie';

import AgentTabSection from '@app/components/Agent/AgentTab';
import AgentTabContent from '@app/components/Agent/AgentTabContent';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@app/components/atoms/Breadcrumb';
import { walletConnectedAtom } from '@app/store/localStore';
import {
    adminAccessAtom,
    currentAgentNameAtom,
    selectedAgentTabAtom
} from '@app/store/localStore';

export default function MyAgentPage() {
    const { data: agent, isLoading: agentLoading } = useQuery<IAgent>({
        queryKey: [`myAgent`],
        queryFn: () => fetchMyAgent()
    });

    const [, setCurrentAgentName] = useAtom(currentAgentNameAtom);
    const [adminAccess] = useAtom(adminAccessAtom);
    const [selectedTab] = useAtom(selectedAgentTabAtom);
    useEffect(() => {
        setCurrentAgentName(agent?.name || '');
    });

    const [walletConnected] = useAtom(walletConnectedAtom);

    const router = useRouter();

    useEffect(() => {
        if (
            Cookies.get('access_token') === null ||
            walletConnected === null ||
            adminAccess
        ) {
            router.push('/');
        }
    }, []);

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

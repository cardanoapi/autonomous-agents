'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { IAgent, fetchAgentbyID } from '@api/agents';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import AgentTabSection from '@app/components/Agent/AgentTab/AgentTab';
import AgentTabContent from '@app/components/Agent/AgentTab/AgentTabContent';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@app/components/atoms/Breadcrumb';
import {
    adminAccessAtom,
    currentAgentNameAtom,
    currentConnectedWalletAtom
} from '@app/store/localStore';

export default function AgentPageById() {
    const [, setCurrentAgentName] = useAtom(currentAgentNameAtom);
    const [adminAccess] = useAtom(adminAccessAtom);
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);
    const params = useParams();
    const router = useRouter();
    const agentID = params.agentID as string;

    const { data: agent, isLoading: agentLoading } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID),
        refetchInterval: 5000
    });

    const [agentOwnerIsUser, setAgentOwnerIsUser] = useState(false);

    useEffect(() => {
        if (agent) {
            setCurrentAgentName(agent?.name || '');
            agent.userAddress === currentConnectedWallet?.address
                ? setAgentOwnerIsUser(true)
                : setAgentOwnerIsUser(false);
        }
    }, [agent]);

    return (
        <>
            <Breadcrumb className={'hidden md:mb-4 md:flex'}>
                <BreadcrumbList>
                    <BreadcrumbItem
                        onClick={() => router.push('/agents')}
                        className="hover:cursor-pointer hover:text-brand-Blue-200"
                    >
                        Agents
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>{agent?.name || 'Agent Profile'}</BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div
                className={
                    'flex h-full w-full flex-col gap-4 overflow-hidden md:h-[600px] md:flex-row 2xl:h-[700px] 4xl:h-[800px]'
                }
            >
                <AgentTabSection
                    showAllTabs={adminAccess || agentOwnerIsUser}
                    className="md:min-h-full md:min-w-[200px]"
                />
                <AgentTabContent
                    agent={agent}
                    agentLoading={agentLoading}
                    enableEdit={adminAccess || agentOwnerIsUser}
                    className="h-full w-full overflow-hidden"
                />
            </div>
        </>
    );
}

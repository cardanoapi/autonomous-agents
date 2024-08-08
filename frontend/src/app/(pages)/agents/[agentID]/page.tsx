'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { IAgent, fetchAgentbyID } from '@api/agents';
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
import {
    adminAccessAtom,
    currentAgentNameAtom,
    currentConnectedWalletAtom,
    selectedAgentTabAtom
} from '@app/store/localStore';

export default function AgentPageById() {
    const [, setCurrentAgentName] = useAtom(currentAgentNameAtom);
    const [adminAccess] = useAtom(adminAccessAtom);
    const [selectedTab] = useAtom(selectedAgentTabAtom);
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);
    const params = useParams();
    const router = useRouter();
    const agentID = params.agentID as string;

    const { data: agent, isLoading: agentLoading } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID)
    });

    const [agentOwnerIsUser, setAgentOwnerIsUser] = useState(false);
    useEffect(() => {
        if (agent) {
            setCurrentAgentName(agent?.name || '');
            console.log(agent.userAddress, currentConnectedWallet?.address);
            agent.userAddress === currentConnectedWallet?.address
                ? setAgentOwnerIsUser(true)
                : setAgentOwnerIsUser(false);
        }
    }, [agent]);

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
            <div className={'flex h-full min-h-[650px] w-full gap-4 '}>
                <AgentTabSection showAllTabs={adminAccess || agentOwnerIsUser} />
                <AgentTabContent
                    agent={agent}
                    agentLoading={agentLoading}
                    enableEdit={adminAccess || agentOwnerIsUser}
                />
            </div>
        </div>
    );
}

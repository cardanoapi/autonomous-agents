'use client';

import { useEffect, useMemo, useState } from 'react';
import React from 'react';

import { IAgent, fetchAgents } from '@api/agents';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { cn } from '@app/components/lib/utils';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import {
    adminAccessAtom,
    agentCreatedAtom,
    currentConnectedWalletAtom
} from '@app/store/localStore';
import { IQueryParams } from '@app/utils/query';

import AgentsContainer from './components/AgentsContainer';
import AgentsTopNav, { AgentsTopNavSkeleton } from './components/AgentsTopNav';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import EmptyScreen from '@app/components/molecules/EmptyScreen';

export default function AgentsPage() {
    const [agentCreated, setAgentCreated] = useAtom(agentCreatedAtom);

    const [adminAccess] = useAtom(adminAccessAtom);

    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);

    const [queryParams, setQueryParams] = useState<IQueryParams>({
        page: 1,
        size: 50,
        search: ''
    });

    const { data: agents, isLoading: isLoading } = useQuery<IAgent[]>({
        queryKey: ['agents', queryParams],
        queryFn: () => fetchAgents(queryParams),
        refetchOnWindowFocus: true,
        refetchOnMount: 'always',
        refetchInterval: 5000,
        refetchIntervalInBackground: true
    });

    const handleSearch = (value: string) => {
        setQueryParams({ page: 1, size: 50, search: value });
    };

    useEffect(() => {
        if (agentCreated) {
            SuccessToast('Agent Created Successfully');
            setAgentCreated(false);
        }
    }, [agentCreated]);

    const otherAgents = useMemo(() => {
        return (
            agents?.filter(
                (agent) => agent.userAddress !== currentConnectedWallet?.address
            ) || []
        );
    }, [agents, currentConnectedWallet?.address]);

    const myAgents = useMemo(() => {
        return (
            agents?.filter(
                (agent) => agent.userAddress === currentConnectedWallet?.address
            ) || []
        );
    }, [agents, currentConnectedWallet?.address]);
    return (
        <>
            <AgentsTopNav
                    numOfAgents={agents?.length || 0}
                    createAgentAccess={adminAccess}
                    onSearch={(value: string) => handleSearch(value)}
            />
            {
                isLoading && < Skeleton className='h-full w-full'/>
            }
            {
                !isLoading && agents && agents.length === 0 && (
                    adminAccess ? (
                    <EmptyScreen msg="No Agents Found" linkHref="/agents/create" linkMsg="Create an Agent to get started" />
                    ) : (
                    <EmptyScreen msg="No Agents Found" />
                    )
                )
                }
            {
                !isLoading && agents && agents?.length > 0 && 
                <div
                    className="overflow-y-auto md:py-4 flex flex-col w-full h-full"
                >
                    <AgentsContainer
                        agentsList={otherAgents || []}
                        enableEdit={adminAccess}
                        enableDelete={adminAccess}
                    />
                    {currentConnectedWallet && !isLoading && myAgents.length > 0 && (
                        <div className={cn(otherAgents.length > 0 && 'my-8' , 'w-full h-full')}>
                            <span className="h1-new mb-4 inline-flex">My Agents</span>
                            <AgentsContainer
                                agentsList={myAgents || []}
                                enableEdit={true}
                                enableDelete={adminAccess}
                            />
                        </div>
                    )}
                </div>
            }
        </>
    );
}

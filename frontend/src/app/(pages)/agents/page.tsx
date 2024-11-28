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

export default function AgentsPage() {
    const [agentCreated, setAgentCreated] = useAtom(agentCreatedAtom);

    const [adminAccess] = useAtom(adminAccessAtom);

    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);

    const [isFirstFetch, setIsFirstFetch] = useState<boolean>(true);

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

    useEffect(() => {
        // is Loading is set to true when query params change and the skeleton is renderd causing the  search value to default to none.
        if (isFirstFetch) {
            setIsFirstFetch(false);
        }
    }, [agents]);

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
            {isLoading && isFirstFetch ? (
                <AgentsTopNavSkeleton />
            ) : (
                <AgentsTopNav
                    numOfAgents={agents?.length || 0}
                    createAgentAccess={adminAccess}
                    onSearch={(value: string) => handleSearch(value)}
                />
            )}

            <div
                className="overflow-y-auto md:overflow-y-hidden md:py-4 md:pr-4 flex flex-col "
            >
                <AgentsContainer
                    agentsList={otherAgents || []}
                    enableEdit={adminAccess}
                    enableDelete={adminAccess}
                    loadingAgents={isLoading}
                />
                {currentConnectedWallet && !isLoading && myAgents.length > 0 && (
                    <div className={cn(otherAgents.length > 0 && 'my-8')}>
                        <span className="h1-new mb-4 inline-flex">My Agents</span>
                        <AgentsContainer
                            agentsList={myAgents || []}
                            enableEdit={true}
                            enableDelete={adminAccess}
                            loadingAgents={false}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

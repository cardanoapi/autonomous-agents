'use client';

import { useEffect, useMemo, useState } from 'react';
import React from 'react';

import { IAgent, fetchAgents } from '@api/agents';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { cn } from '@app/components/shadcn/lib/utils';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import {
    adminAccessAtom,
    agentCreatedAtom,
    currentConnectedWalletAtom
} from '@app/store/localStore';
import { IQueryParams } from '@app/utils/query';

import AgentsTopNav, { AgentsTopNavSkeleton } from '../../../components/organisms/layout/AgentsTopNav';
import AgentCard, { AgentCardSkeleton } from '@app/components/organisms/cards/AgentCard';

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

    const { data: agents, isLoading } = useQuery<IAgent[]>({
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
        if (isFirstFetch) {
            setIsFirstFetch(false);
        }
    }, [agents]);

    const otherAgents = useMemo(() => {
        return agents?.filter(agent => agent.userAddress !== currentConnectedWallet?.address) || [];
    }, [agents, currentConnectedWallet?.address]);

    const myAgents = useMemo(() => {
        return agents?.filter(agent => agent.userAddress === currentConnectedWallet?.address) || [];
    }, [agents, currentConnectedWallet?.address]);

    const gridClass = "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:pr-12 4xl:grid-cols-5 5xl:grid-cols-6"

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

            <ScrollArea className="mt-5 max-h-agentsList overflow-y-auto py-4 pr-4" scrollHideDelay={200}>
                {/* Render Other Agents */}
                <div className={gridClass}>
                    {isLoading
                        ? Array.from({ length: 10 }).map((_, index) => (
                            <AgentCardSkeleton key={index} />
                        ))
                        : otherAgents.map(agent => (
                            <AgentCard
                                key={agent.id}
                                agentName={agent.name || 'NA'}
                                agentID={agent.id || ''}
                                functionCount={agent.total_functions || 0}
                                templateName={agent.template_name}
                                totalTrigger={0}
                                lastActive={agent.last_active || 'NA'}
                                enableEdit={adminAccess}
                                isActive={agent.is_active}
                                enableDelete={adminAccess}
                                no_of_successful_triggers={agent.no_of_successfull_triggers}
                                agentSecretKey={agent.secret_key}
                            />
                        ))}
                </div>

                {/* Render My Agents */}
                {currentConnectedWallet && !isLoading && myAgents.length > 0 && (
                    <div className={cn(otherAgents.length > 0 && 'my-8')}>
                        <span className="h1-new mb-4 inline-flex">My Agents</span>
                        <div className={gridClass}>
                            {myAgents.map(agent => (
                                <AgentCard
                                    key={agent.id}
                                    agentName={agent.name || 'NA'}
                                    agentID={agent.id || ''}
                                    functionCount={agent.total_functions || 0}
                                    templateName={agent.template_name}
                                    totalTrigger={0}
                                    lastActive={agent.last_active || 'NA'}
                                    enableEdit={true}
                                    isActive={agent.is_active}
                                    enableDelete={adminAccess}
                                    no_of_successful_triggers={agent.no_of_successfull_triggers}
                                    agentSecretKey={agent.secret_key}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </>
    );
}
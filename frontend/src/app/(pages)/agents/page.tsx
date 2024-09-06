'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { IAgent, fetchAgents } from '@app/app/api/agents';
import { Button } from '@app/components/atoms/Button';
import { SearchField } from '@app/components/atoms/SearchField';
import { cn } from '@app/components/lib/utils';
import AgentCard, { AgentCardSkeleton } from '@app/components/molecules/AgentCard';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import {
    adminAccessAtom,
    agentCreatedAtom,
    currentConnectedWalletAtom
} from '@app/store/localStore';

export default function AgentsPage() {
    const [agentCreated, setAgentCreated] = useAtom(agentCreatedAtom);

    const [adminAccess] = useAtom(adminAccessAtom);
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);

    // Fetching agents directly from the API using useQuery for more responsive loading state management, instead of relying on the Jotai atom.
    const { data: agents, isLoading: isLoading } = useQuery<IAgent[]>({
        queryKey: ['agents'],
        queryFn: fetchAgents,
        refetchOnWindowFocus: true,
        refetchOnMount: 'always',
        refetchInterval: 5000,
        refetchIntervalInBackground: true
    });

    useEffect(() => {
        if (agentCreated) {
            SuccessToast('Agent Created Successfully');
            setAgentCreated(false);
        }
    }, [agentCreated]);

    const filteredAgents =
        agents?.filter((agent) =>
            currentConnectedWallet
                ? agent.userAddress !== currentConnectedWallet.address
                : true
        ) || [];

    const myAgents =
        agents?.filter(
            (agent) => agent.userAddress === currentConnectedWallet?.address
        ) || [];

    return (
        <>
            {isLoading ? (
                <TopNavSkeleton />
            ) : (
                <TopNav
                    numOfAgents={agents?.length || 0}
                    createAgentAccess={adminAccess}
                />
            )}

            <ScrollArea
                className="mt-12 max-h-agentsList overflow-y-auto pr-4"
                scrollHideDelay={200}
            >
                <AgentsContainer
                    agentsList={filteredAgents}
                    enableEdit={adminAccess}
                    enableDelete={adminAccess}
                    loadingAgents={isLoading}
                />

                {currentConnectedWallet && !isLoading && myAgents.length > 0 && (
                    <div className="my-8">
                        <span className="h1-new mb-4 inline-flex">My Agents</span>
                        <AgentsContainer
                            agentsList={myAgents}
                            enableEdit={true}
                            enableDelete={adminAccess}
                            loadingAgents={false}
                        />
                    </div>
                )}
            </ScrollArea>
        </>
    );
}

interface AgentsContainerProps {
    agentsList: IAgent[];
    enableEdit: boolean;
    enableDelete: boolean;
    loadingAgents?: boolean;
}

const AgentsContainer: React.FC<AgentsContainerProps> = ({
    agentsList,
    enableEdit,
    enableDelete,
    loadingAgents = false
}) => {
    if (agentsList.length === 0 && !loadingAgents) {
        return <div>No Agents Found</div>;
    }
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:pr-12 4xl:grid-cols-5 5xl:grid-cols-6">
            {loadingAgents
                ? Array.from({ length: 10 }).map((_, index) => (
                      <AgentCardSkeleton key={index} />
                  ))
                : agentsList.map((agent) => (
                      <AgentCard
                          key={agent.id}
                          agentName={agent.name || 'NA'}
                          agentID={agent.id || ''}
                          functionCount={agent.total_functions || 0}
                          templateID={agent.template_id}
                          totalTrigger={0}
                          lastActive={agent.last_active || 'NA'}
                          enableEdit={enableEdit}
                          enableDelete={enableDelete}
                          isActive={agent.is_active}
                      />
                  ))}
        </div>
    );
};

const TopNav = ({
    numOfAgents,
    createAgentAccess
}: {
    numOfAgents: number;
    createAgentAccess: boolean;
}) => {
    return (
        <div className="flex justify-between">
            <div className="flex items-center gap-x-4">
                <span className="h1-new">Agents({numOfAgents})</span>
                <SearchField
                    placeholder="Search agents"
                    variant={'secondary'}
                    className="h-10 min-w-[420px]"
                    onSearch={() => {}}
                ></SearchField>
            </div>

            <Link href="/agents/create-agent">
                <Button
                    variant="primary"
                    className={cn(
                        'h-[36px] w-[145px]',
                        createAgentAccess ? '' : '!hidden'
                    )}
                >
                    Create Agent
                </Button>
            </Link>
        </div>
    );
};

const TopNavSkeleton = () => {
    return (
        <div className="flex justify-between">
            <div className="flex items-center gap-x-4">
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-10 min-w-[420px]" />
            </div>
        </div>
    );
};

'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { IAgent, fetchAgents } from '@app/app/api/agents';
import { Button } from '@app/components/atoms/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { SearchField } from '@app/components/atoms/SearchField';
import { cn } from '@app/components/lib/utils';
import AgentCard from '@app/components/molecules/AgentCard';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { adminAccessAtom, agentCreatedAtom } from '@app/store/localStore';

export default function AgentsPage() {
    const [agentCreated, setAgentCreated] = useAtom(agentCreatedAtom);
    const [adminAccess] = useAtom(adminAccessAtom);

    const {
        data: agents,
        isLoading,
        refetch
    } = useQuery<IAgent[]>({
        queryKey: ['agents'],
        queryFn: fetchAgents,
        refetchOnWindowFocus: true,
        refetchOnMount: 'always',
        refetchInterval: 20000,
        refetchIntervalInBackground: true
    });

    const [filteredAgents, setFilteredAgents] = useState<IAgent[]>([]);

    useEffect(() => {
        if (agentCreated) {
            SuccessToast('Agent Created Successfully');
            setAgentCreated(false);
        }
        if (agents) {
            setFilteredAgents(agents);
        }
    }, [agentCreated, agents]);

    useEffect(() => {
        if (agents) {
            setFilteredAgents(agents);
        }
    }, [agents]);

    function handleSearch(agentName: string) {
        const newAgents =
            agents?.filter((agent) =>
                agent.name.toLowerCase().includes(agentName.toLowerCase())
            ) || [];
        setFilteredAgents(newAgents);
    }

    return (
        <>
            <div className="flex justify-between">
                <div className="flex items-center gap-x-4">
                    <span className="h1-new">Agents({agents?.length})</span>
                    <SearchField
                        placeholder="Search agents"
                        variant={'secondary'}
                        className="h-10 min-w-[290px]"
                        onSearch={handleSearch}
                    ></SearchField>
                    <DropdownMenu>
                        <DropdownMenuTrigger border={true} className="h-10">
                            Template
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Oldest</DropdownMenuItem>
                            <DropdownMenuItem>Newest</DropdownMenuItem>
                            <DropdownMenuItem>Most Active</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Link href="/agents/create-agent">
                    <Button
                        variant="primary"
                        className={cn(
                            'h-[36px] w-[145px]',
                            adminAccess ? '' : '!hidden'
                        )}
                    >
                        Create Agent
                    </Button>
                </Link>
            </div>
            {isLoading ? (
                <SkeletonLoadingForAgentsPage />
            ) : (
                <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-5 5xl:grid-cols-6">
                    {Array.isArray(filteredAgents) && filteredAgents.length ? (
                        filteredAgents.map((agent: IAgent, index) => (
                            <AgentCard
                                agentName={agent?.name || 'NA'}
                                agentID={agent?.id || ''}
                                functionCount={agent?.total_functions || 0}
                                templateID={agent?.template_id || ''}
                                totalTrigger={0}
                                lastActive={agent?.last_active || 'NA'}
                                key={index}
                                refetchData={refetch}
                                enableEdit={adminAccess}
                            />
                        ))
                    ) : (
                        <span>No Agents Found.</span>
                    )}
                </div>
            )}
        </>
    );
}

const SkeletonLoadingForAgentsPage = () => {
    return (
        <div className={'mt-12 flex flex-wrap gap-8'}>
            {Array(8)
                .fill(undefined)
                .map((_, index) => (
                    <Skeleton className={'h-[240px] w-[240px]'} key={index} />
                ))}
        </div>
    );
};

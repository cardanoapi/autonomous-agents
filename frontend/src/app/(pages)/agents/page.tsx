'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useAtom } from 'jotai';

import { IAgent } from '@app/app/api/agents';
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
import {
    adminAccessAtom,
    agentCreatedAtom,
    agentsAtom,
    currentConnectedWalletAtom
} from '@app/store/localStore';

export default function AgentsPage() {
    const [agentCreated, setAgentCreated] = useAtom(agentCreatedAtom);
    const [adminAccess] = useAtom(adminAccessAtom);
    const [agentsMap] = useAtom(agentsAtom);
    const [agents, setAgents] = useState<IAgent[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<IAgent[]>([]);
    const [myAgents, setMyAgents] = useState<IAgent[]>([]);
    const [otherAgents, setOtherAgents] = useState<IAgent[]>([]);
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);

    useEffect(() => {
        if (agentsMap) {
            setAgents(Object.values(agentsMap));
        }
    }, [agentsMap]);

    useEffect(() => {
        if (agentCreated) {
            SuccessToast('Agent Created Successfully');
            setAgentCreated(false);
        }
        setFilteredAgents(agents);
    }, [agentCreated, agents]);

    function handleSearch(agentName: string) {
        const newAgents = agents.filter((agent) =>
            agent.name.toLowerCase().includes(agentName.toLowerCase())
        );
        setFilteredAgents(newAgents);
    }

    useEffect(() => {
        const filteredMyAgents = filteredAgents.filter(
            (agent) => agent.userAddress === currentConnectedWallet?.address
        );
        const filteredOtherAgents = filteredAgents.filter(
            (agent) => agent.userAddress !== currentConnectedWallet?.address
        );
        setMyAgents(filteredMyAgents);
        setOtherAgents(filteredOtherAgents);
    }, [filteredAgents, currentConnectedWallet]);

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
            <AgentsContainer agentsList={otherAgents} enableEdit={adminAccess} />
            {currentConnectedWallet && myAgents.length > 0 && (
                <div className="my-8">
                    <div className="h1-new">My Agents</div>
                    <AgentsContainer agentsList={myAgents} enableEdit={true} />
                </div>
            )}
            {otherAgents.length == 0 && myAgents.length == 0 && (
                <span>No Any Agents Found</span>
            )}
        </>
    );
}

const AgentsContainer = ({
    agentsList,
    enableEdit
}: {
    agentsList: IAgent[];
    enableEdit: boolean;
}) => {
    return (
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-5 5xl:grid-cols-6">
            {Array.isArray(agentsList) && agentsList.length ? (
                agentsList.map((agent: IAgent, index) => (
                    <AgentCard
                        agentName={agent?.name || 'NA'}
                        agentID={agent?.id || ''}
                        functionCount={agent?.total_functions || 0}
                        templateID={agent?.template_id || ''}
                        totalTrigger={0}
                        lastActive={agent?.last_active || 'NA'}
                        key={index}
                        enableEdit={enableEdit}
                        isActive={agent?.is_active}
                    />
                ))
            ) : (
                <></>
            )}
        </div>
    );
};

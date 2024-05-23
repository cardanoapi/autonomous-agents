'use client';

import Link from 'next/link';

import { useMutation, useQuery } from '@tanstack/react-query';

import { IAgent, fetchAgents } from '@app/app/api/agents';
import { deleteAgentbyID } from '@app/app/api/agents';
import { Button } from '@app/components/atoms/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { SearchField } from '@app/components/atoms/SearchField';
import AgentCard, { IAgentCard } from '@app/components/molecules/AgentCard';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';
import { useEffect, useState } from 'react';
import {atom, useAtom} from 'jotai'
import { agentCreatedAtom } from '@app/store/loaclStore';
import { SuccessToast } from '@app/components/molecules/CustomToasts';



export default function AgentsPage() {
    const [agentCreated , setAgentCreated] = useAtom(agentCreatedAtom)
    const {
        data: agents,
        isLoading: loadingAgents,
        isError: errorAgents
    } = useQuery<IAgent[]>({ queryKey: ['agents'], queryFn: fetchAgents });
    
   
    useEffect(()=>{
        if (agentCreated === true){
            SuccessToast('Agent Created Successfully')
            setAgentCreated(false)
        }
    },[])

    
    return (
        <>
            <div className="flex justify-between">
                <div className="flex items-center gap-x-4">
                    <span className="h1-new">Agents({agents?.length})</span>
                    <SearchField
                        placeholder="Search agents"
                        variant={'secondary'}
                        className="h-10 min-w-[290px]"
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
                    <Button variant="primary" size="md">
                        Create Agent
                    </Button>
                </Link>
            </div>
            <div className="3xl:grid-cols-4 5xl:grid-cols-6 mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-5 4xl:grid-cols-5">
                {agents?.map((agent: IAgent, index) => (
                    <AgentCard
                        agentName={agent?.name || 'NA'}
                        agentID={agent?.id}
                        agentRole={'null'}
                        templateID={agent?.template_id}
                        totalTrigger={0}
                        lastActive={agent?.last_active || 'NA'}
                        functionCount={0}
                        key={index}
                    />
                ))}
                </div>
        </>
    );
}

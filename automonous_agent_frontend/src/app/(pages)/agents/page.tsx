"use client"

import { fetchAgents, IAgent } from "@app/app/api/agents"
import { Button } from "@app/components/atoms/Button"
import { DropdownMenu, DropdownMenuTrigger , DropdownMenuContent , DropdownMenuItem } from "@app/components/atoms/DropDownMenu"
import { SearchField } from "@app/components/atoms/SearchField"
import AgentCard, { IAgentCard } from "@app/components/molecules/AgentCard"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"


const DemoAgentList : IAgentCard[] = [
    {
        agentName : 'Agent#1',
        agentRole : "Drep",
        functionCount : 3 ,
        templateID : 'null',
        lastActive : '2024-04-19',
        totalTrigger : 54,
    },
    {
        agentName : 'Agent#2',
        agentRole : "Drep",
        functionCount : 3 ,
        templateID : 'null',
        lastActive : '2024-04-19',
        totalTrigger : 102,
    },
    {
        agentName : 'Agent#3',
        agentRole : "Drep",
        templateID : 'null',
        functionCount : 1 ,
        lastActive : '2024-04-19',
        totalTrigger : 645,
    }, {
        agentName : 'Agent#4',
        agentRole : "Drep",
        templateID : 'null',
        functionCount : 5 ,
        lastActive : '2024-04-19',
        totalTrigger : 192,
    }, {
        agentName : 'Agent#5',
        agentRole : "Drep",
        functionCount : 8 ,
        templateID : 'null',
        lastActive : '2024-04-19',
        totalTrigger : 32,
    }, {
        agentName : 'Agent#6',
        agentRole : "Drep",
        functionCount : 2 ,
        templateID : 'null',
        lastActive : '2024-04-19',
        totalTrigger : 542,
    },
    {
        agentName : 'Agent#7',
        agentRole : "Drep",
        templateID : 'null',
        functionCount : 2 ,
        lastActive : '2024-04-19',
        totalTrigger : 542,
    },
]

export default function AgentsPage(){
    
    const {data:agents , isLoading:loadingAgents , isError: errorAgents} = useQuery<IAgent[]>({queryKey:['agents'] , queryFn:fetchAgents})

    return(
        <>
        <div className="flex justify-between">
            <div className="flex gap-x-4 items-center">
            <span className="h1-new">Agents(8)</span>
            <SearchField placeholder="Search agents" variant={"secondary"} className="w-[45%] 2xl:w-[80%] h-10"></SearchField>
            <DropdownMenu>
                <DropdownMenuTrigger border={true} className="h-10">Template</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Oldest</DropdownMenuItem>
                    <DropdownMenuItem>Newest</DropdownMenuItem>
                    <DropdownMenuItem>Most Active</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
            <Link href="/agents/create-agent">
            <Button variant="primary" size="md">Create Agent</Button>
            </Link>
        </div>
        <div className="grid grid-cols-4 mt-8 gap-4 2xl:grid-cols-6 2xl:mt-12 gap-y-6">
            {/*{DemoAgentList.map((item , index) => (
                <AgentCard agentName={item.agentName} agentRole={item.agentRole} templateName={item.templateName} totalTrigger={item.totalTrigger} lastActive={item.lastActive} functionCount={item.functionCount} key={index}/>
            ))} */ }
            {agents?.map((item : IAgent, index)=>(
                <AgentCard agentName={item?.name || 'NA'} agentRole={'null'} templateID={item?.template_id}  totalTrigger={0} lastActive={item?.last_active || 'NA'} functionCount={0} key={index}/>
            ))}
        </div>
        </>
    )
}
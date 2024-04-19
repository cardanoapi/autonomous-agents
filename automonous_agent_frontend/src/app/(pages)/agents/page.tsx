import { Button } from "@app/components/atoms/Button"
import { DropdownMenu, DropdownMenuTrigger , DropdownMenuContent , DropdownMenuItem } from "@app/components/atoms/DropDownMenu"
import { Label } from "@app/components/atoms/label"
import { SearchField } from "@app/components/atoms/SearchField"
import AgentCard, { IAgentCard } from "@app/components/molecules/AgentCard"
import Link from "next/link"


const DemoAgentList : IAgentCard[] = [
    {
        agentName : 'Agent#1',
        agentRole : "Drep",
        template : "Send Ada Template",
        functionCount : 3 ,
        lastActive : '2024-04-19',
        totalTrigger : 54,
    },
    {
        agentName : 'Agent#2',
        agentRole : "Drep",
        template : "Voting Template",
        functionCount : 3 ,
        lastActive : '2024-04-19',
        totalTrigger : 102,
    },
    {
        agentName : 'Agent#3',
        agentRole : "Drep",
        template : "Burn Ada Template",
        functionCount : 1 ,
        lastActive : '2024-04-19',
        totalTrigger : 645,
    }, {
        agentName : 'Agent#4',
        agentRole : "Drep",
        template : "Create Proposal",
        functionCount : 5 ,
        lastActive : '2024-04-19',
        totalTrigger : 192,
    }, {
        agentName : 'Agent#5',
        agentRole : "Drep",
        template : "Send Ada Template",
        functionCount : 8 ,
        lastActive : '2024-04-19',
        totalTrigger : 32,
    }, {
        agentName : 'Agent#6',
        agentRole : "Drep",
        template : "Burn Ada Template",
        functionCount : 2 ,
        lastActive : '2024-04-19',
        totalTrigger : 542,
    }
]

export default function AgentsPage(){
    return(
        <>
        <div className="flex justify-between">
            <div className="flex gap-x-4 items-center">
            <Label size={"large"} className="text-[18px]">Agents(8)</Label>
            <SearchField placeholder="Search agents" variant={"secondary"} className="w-[240px] h-[40px]"></SearchField>
            <DropdownMenu>
                <DropdownMenuTrigger border={true} className="h-[40px]">Template</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Oldest</DropdownMenuItem>
                    <DropdownMenuItem>Newest</DropdownMenuItem>
                    <DropdownMenuItem>Most Active</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
            <Link href="/agents/create-agent">
            <Button variant="primary" size="md" className="w-[145px]">Create Agent</Button>
            </Link>
        </div>
        <div className="grid grid-cols-4 mt-8 gap-x-8 gap-y-6">
            {DemoAgentList.map((item , index) => (
                <AgentCard agentName={item.agentName} agentRole={item.agentRole} template={item.template} totalTrigger={item.totalTrigger} lastActive={item.lastActive} functionCount={item.functionCount}/>
            ))}
        </div>
        </>
    )
}
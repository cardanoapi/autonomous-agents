'use client'
import Head from 'next/head';
import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import OverViewCard, { IOverViewCard } from '@app/components/molecules/OverViewCard';
import CustomLineChart from '@app/components/molecules/chart/CustomLineChart';

import OverViewAgentsCard from './components/OverViewAgentsCard';
import OverViewTemplatesCard from './components/OverViewTemplatesCard';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchActiveAgentsCount, fetchAgents } from './api/agents';
import { fetchTemplates } from './api/templates';

export interface IAgentsCardData{
    totalAgents : number
    activeAgents : number
    inactiveAgents : number
}

export default function Home() {
    const {data: agents = []} = useQuery({queryKey:['agents'] , queryFn: fetchAgents})
    const {data : activeAgents} = useQuery({queryKey:['activeAgentsCount'] , queryFn:fetchActiveAgentsCount})

    const {data : templates=[]} = useQuery({queryKey:['templates'] , queryFn: fetchTemplates})
    
    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>

            {/* Agents Overview Card */}
            <div className="flex grid-cols-4 justify-between gap-[12px] 2xl:gap-[2%] h-36">
                <OverViewAgentsCard
                    title="No of Agents"
                    totalAgents={agents?.length || 'NA'}
                    activeAgents={activeAgents?.online_agents_count}
                    inactiveAgents={agents?.length - activeAgents?.online_agents_count}
                />
                <OverViewTemplatesCard
                    title="No of Templates"
                    totalTemplates={templates?.length}
                    defaultTemplates={13}
                    customTemplates={2}
                />
                {/* To do Overview cards */}
                <OverViewAgentsCard
                    title="Active Templates"
                    totalAgents={100}
                    activeAgents={48}
                    inactiveAgents={52}
                />
                <OverViewTemplatesCard
                    title="Agent Functions"
                    totalTemplates={8}
                    defaultTemplates={5}
                    customTemplates={3}
                />
            </div>

            {/* Dashboard Chart*/}
            <Card className="mt-8 flex flex-row gap-y-8 py-4 pr-12  pb-16 pt-2">
                <span className="h4 rotate-180 text-center [writing-mode:vertical-lr]">
                    No of transaction
                </span>
                <div className="mt-5 w-full pr-6">
                    <div className="flex justify-between">
                        <span className="title-1">Live Transactions</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger border={true}>
                                Today
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Last 3 Days</DropdownMenuItem>
                                <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
                                <DropdownMenuItem>Last Month</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className='h-[355px] mt-2 2xl:h-[500px]'>
                        <CustomLineChart />
                    </div>
                </div>
            </Card>
        </>
    );
}

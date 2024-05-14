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

export default function Home() {
    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>

            {/* Agents Overview Card */}
            <div className="flex grid-cols-4 justify-between gap-[1%] 2xl:gap-[2%]">
                <OverViewAgentsCard
                    title="Number of Agents"
                    totalAgents={200}
                    activeAgents={172}
                    inactiveAgents={28}
                />
                <OverViewTemplatesCard
                    title="Number of Templates"
                    totalTemplates={15}
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
            <Card className="mt-8 flex max-h-[60vh]  flex-row gap-y-8 py-4 pr-12  pb-16">
                <span className="h4 rotate-180 text-center [writing-mode:vertical-lr]">
                    No of transaction
                </span>
                <div className="mt-6 w-full pr-6">
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
                    <div className='h-[95%]'>
                        <CustomLineChart />
                    </div>
                </div>
            </Card>
        </>
    );
}

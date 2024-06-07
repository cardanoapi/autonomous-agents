'use client';

import { useEffect, useState } from 'react';

import Head from 'next/head';

import { useQuery } from '@tanstack/react-query';

import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import CustomLineChart, {
    ILineChartData
} from '@app/components/molecules/chart/CustomLineChart';

import { fetchActiveAgentsCount, fetchAgents } from './api/agents';
import { fetchTemplates } from './api/templates';
import { fetchTransactionsCount } from './api/trigger';
import OverViewAgentsCard from './components/OverViewAgentsCard';
import OverViewGraphCard from './components/OverViewGraphCard';
import OverViewTemplatesCard from './components/OverViewTemplatesCard';

export interface IAgentsCardData {
    totalAgents: number;
    activeAgents: number;
    inactiveAgents: number;
}

export const demoPropsalGraphData: ILineChartData[] = [
    { name: 'a', amt: 0 },
    { name: 'b', amt: 5 },
    { name: 'c', amt: 12 },
    { name: 'd', amt: 11 },
    { name: 'e', amt: 7 }
];

export const demoVoterGraphData: ILineChartData[] = [
    { name: 'a', amt: 0 },
    { name: 'b', amt: 4 },
    { name: 'c', amt: 10 },
    { name: 'd', amt: 12 }
];

export default function Home() {
    const { data: agents = [] } = useQuery({
        queryKey: ['agents'],
        queryFn: fetchAgents
    });
    const { data: activeAgents } = useQuery({
        queryKey: ['activeAgentsCount'],
        queryFn: fetchActiveAgentsCount
    });
    const { data: templates = [] } = useQuery({
        queryKey: ['templates'],
        queryFn: fetchTemplates
    });
    const { data: transactionCount = {} } = useQuery({
        queryKey: ['transactionCounts'],
        queryFn: () => fetchTransactionsCount('true')
    });
    const [filteredChartData, setFilteredChartData] = useState<ILineChartData[]>([]);
    const [currentChartFilter, setCurrentChartFilter] = useState('Last 24 Hours');
    const [currentChartUnit, setCurrentChartUnit] = useState('Hours');

    const getFilteredData = (
        data: Record<string, number>,
        filter: string
    ): ILineChartData[] => {
        const now = new Date();
        let filteredData: ILineChartData[] = [];

        if (filter === 'Last Hour') {
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const timestamps = [];

            for (
                let m = new Date(oneHourAgo);
                m <= now;
                m.setMinutes(m.getMinutes() + 1)
            ) {
                timestamps.push(new Date(m).toISOString());
            }

            filteredData = timestamps.map((timestamp) => ({
                name: timestamp,
                amt: data[timestamp] ?? 0
            }));
            setCurrentChartUnit('Mins');
        } else if (filter === 'Last 24 Hours') {
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const hourlyData: Record<string, number> = {};
            const timestamps = [];

            for (
                let h = new Date(twentyFourHoursAgo);
                h <= now;
                h.setHours(h.getHours() + 1)
            ) {
                const hour = h.toISOString().slice(0, 13) + ':00:00';
                timestamps.push(hour);
                hourlyData[hour] = 0;
            }

            Object.entries(data)
                .filter(([key]) => new Date(key) > twentyFourHoursAgo)
                .forEach(([key, value]) => {
                    const hour = new Date(key).toISOString().slice(0, 13) + ':00:00';
                    hourlyData[hour] += value;
                });

            filteredData = timestamps.map((timestamp) => ({
                name: timestamp,
                amt: hourlyData[timestamp] ?? 0
            }));
            setCurrentChartUnit('Hours');
        }

        return filteredData;
    };

    useEffect(() => {
        const filteredData = getFilteredData(transactionCount, currentChartFilter);
        setFilteredChartData(filteredData);
        console.log(filteredData);
    }, [currentChartFilter, transactionCount]);

    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>

            <div className="flex h-36 grid-cols-4 gap-[12px] 2xl:gap-[25px] ">
                <OverViewAgentsCard
                    title="No of Agents"
                    totalAgents={agents.length || 'NA'}
                    activeAgents={activeAgents?.online_agents_count}
                    inactiveAgents={Math.max(
                        0,
                        agents.length - activeAgents?.online_agents_count
                    )}
                />
                <OverViewTemplatesCard
                    title="No of Templates"
                    totalTemplates={templates.length}
                    defaultTemplates={templates.length}
                    customTemplates={0}
                />
                <OverViewGraphCard
                    title="No of Proposals"
                    totalValue={6}
                    changeRate={5}
                    graphData={demoPropsalGraphData}
                />
                <OverViewGraphCard
                    title="No of Voters"
                    totalValue={5321}
                    changeRate={19}
                    theme="Secondary"
                    graphData={demoVoterGraphData}
                />
            </div>

            <Card className="mt-8 flex flex-row gap-y-8 py-4 pb-16 pr-12 pt-2 2xl:mt-12 5xl:mt-16">
                <span className="h4 rotate-180 text-center [writing-mode:vertical-lr]">
                    Transaction Volume
                </span>
                <div className="mt-5 w-full pr-6">
                    <div className="flex justify-between">
                        <span className="title-1">Transactions</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger border={true}>
                                {currentChartFilter}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCurrentChartFilter('Last Hour');
                                    }}
                                >
                                    Last Hour
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCurrentChartFilter('Last 24 Hours');
                                    }}
                                >
                                    Last 24 Hours
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="mt-2 h-[355px] 2xl:h-[500px] 4xl:h-[600px]">
                        <CustomLineChart chartData={filteredChartData} />
                        <div className="mt-2 text-center">
                            Time ({currentChartUnit})
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
}

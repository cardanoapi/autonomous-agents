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
import { getFilteredData } from '@app/utils/dashboard';

import { fetchTransactionsCount } from './api/trigger';
import DashboardCards from './components/DashboardCards';

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
    const { data: transactionCount = {} } = useQuery({
        queryKey: ['transactionCounts'],
        queryFn: () => fetchTransactionsCount('true')
    });
    const [filteredChartData, setFilteredChartData] = useState<ILineChartData[]>([]);
    const [currentChartFilter, setCurrentChartFilter] = useState('Last 24 Hours');
    const [currentChartUnit, setCurrentChartUnit] = useState('Hours');

    const getCurrentChartUnit = (filter: string): string => {
        if (filter === 'Last Hour') return 'Mins';
        else if (filter === 'Last 24 Hours') return 'Hours';
        else return '';
    };

    useEffect(() => {
        const filteredData = getFilteredData(transactionCount, currentChartFilter);
        const chartUnit = getCurrentChartUnit(currentChartFilter);
        chartUnit && setCurrentChartUnit;
        setFilteredChartData(filteredData);
    }, [currentChartFilter, transactionCount]);

    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>
            <div className="w-full overflow-y-auto">
                <DashboardCards />
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

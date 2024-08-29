'use client';

import { useState } from 'react';

import Head from 'next/head';

import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useQuery } from '@tanstack/react-query';

import { convertDictToGraphDataFormat } from '@app/components/Chart/ChartFilter';
import {
    IChartFilterOption,
    chartFilterOptions
} from '@app/components/Chart/ChartFilter';
import CustomLineChart from '@app/components/Chart/CustomLineChart';
import { ILineChartData } from '@app/components/Chart/CustomLineChart';
import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

import DashboardCards from './components/DashboardCards';

interface IDataSource {
    placeholder: string;
    timeUnit: string;
    chartData: ILineChartData[];
    xAxisInterval: number;
}

export default function Home() {
    const { data: triggerHistoryMetric, isLoading: isLoading } = useQuery({
        queryKey: ['TriggerHistoyMetric'],
        queryFn: () => fecthTriggerHistoryMetric([]),
        refetchInterval: 60000
    });

    const [currentChartFilterOption, setCurrentChartFilterOption] = useState<number>(2);

    const dataSources: IDataSource[] = [
        {
            placeholder: 'Last Hour',
            timeUnit: 'Mins',
            chartData: convertDictToGraphDataFormat(
                triggerHistoryMetric?.last_hour_successful_triggers || [],
                'Mins'
            ),
            xAxisInterval: 5
        },
        {
            placeholder: 'Last 24 Hours',
            timeUnit: 'Hours',
            chartData: convertDictToGraphDataFormat(
                triggerHistoryMetric?.last_24hour_successful_triggers || [],
                'Hours'
            ),
            xAxisInterval: 2
        },
        {
            placeholder: 'Last 7 Days',
            timeUnit: 'Days',
            chartData: convertDictToGraphDataFormat(
                triggerHistoryMetric?.last_week_successful_triggers || [],
                'Days'
            ),
            xAxisInterval: 0
        }
    ];

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

                        {isLoading ? (
                            <Skeleton className="h-8 w-40" />
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    border={true}
                                    className="flex min-w-40 justify-between"
                                >
                                    {dataSources[currentChartFilterOption].placeholder}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white">
                                    {chartFilterOptions.map(
                                        (item: IChartFilterOption, index) => (
                                            <DropdownMenuItem
                                                key={index}
                                                onClick={() =>
                                                    setCurrentChartFilterOption(index)
                                                }
                                            >
                                                {item.placeholder}
                                            </DropdownMenuItem>
                                        )
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    <div className="mt-2 h-[355px] max-h-[calc(100vh-500px)] 2xl:h-[500px] 4xl:h-[600px]">
                        {isLoading ? (
                            <div className="h-full w-full pl-8 pt-6">
                                <Skeleton className="h-full w-full" />
                            </div>
                        ) : (
                            <>
                                <CustomLineChart
                                    chartData={
                                        dataSources[currentChartFilterOption].chartData
                                    }
                                    xaxisInterval={
                                        dataSources[currentChartFilterOption]
                                            .xAxisInterval
                                    }
                                    className="pt-10"
                                />
                                <div className="mt-2 text-center">
                                    Time (
                                    {dataSources[currentChartFilterOption].timeUnit})
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Card>
        </>
    );
}

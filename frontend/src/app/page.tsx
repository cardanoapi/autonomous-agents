'use client';

import { useEffect, useState } from 'react';

import Head from 'next/head';

import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
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

import DashboardCards from './components/DashboardCards';

export default function Home() {
    const { data: triggerHistoryMetric } = useQuery({
        queryKey: ['TriggerHistoyMetric'],
        queryFn: () => fecthTriggerHistoryMetric([])
    });

    const [currentChartFilter, setCurrentChartFilter] = useState('Last 24 Hours');
    const [currentChartUnit, setCurrentChartUnit] = useState('Hours');
    const [chartDataSource, setChartDataSource] = useState<number[]>([]);

    function convertArraytoGraphDataFormat(arr: number[]): ILineChartData[] {
        return arr.map((val, index) => ({
            name: `a${index}`,
            amt: val
        }));
    }

    useEffect(() => {
        if (triggerHistoryMetric !== undefined) {
            switch (currentChartFilter) {
                case 'Last Hour':
                    setChartDataSource(
                        triggerHistoryMetric.last_hour_successful_triggers
                    );
                    break;
                case 'Last 24 Hours':
                    setChartDataSource(
                        triggerHistoryMetric.last_24hour_successful_triggers
                    );
                    break;
                case 'Last 7 Days':
                    setChartDataSource(
                        triggerHistoryMetric.last_week_successful_triggers
                    );
                    break;
            }
        }
    }, [currentChartFilter, triggerHistoryMetric]);

    interface IChartUnit {
        placeholder: string;
        unit: string;
    }

    const chartUnits: IChartUnit[] = [
        {
            placeholder: 'Last Hour',
            unit: 'Mins'
        },
        {
            placeholder: 'Last 24 Hours',
            unit: 'Hours'
        },
        {
            placeholder: 'Last 7 Days',
            unit: 'Days'
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
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                border={true}
                                className="flex min-w-40 justify-between"
                            >
                                {currentChartFilter}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
                                {chartUnits.map((item: IChartUnit, index) => (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setCurrentChartFilter(item.placeholder);
                                            setCurrentChartUnit(item.unit);
                                        }}
                                        key={index}
                                    >
                                        {item.placeholder}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="mt-2 h-[355px] 2xl:h-[500px] 4xl:h-[600px]">
                        <CustomLineChart
                            chartData={
                                triggerHistoryMetric !== undefined
                                    ? convertArraytoGraphDataFormat(
                                          chartDataSource.toReversed() || []
                                      )
                                    : []
                            }
                        />
                        <div className="mt-2 text-center">
                            Time ({currentChartUnit})
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
}

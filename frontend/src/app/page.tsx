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

    interface IChartFilterOption {
        placeholder: string;
        unit: string;
        xaxisInterval: number;
    }

    const [chartDataSource, setChartDataSource] = useState<number[]>([]);
    const chartFilterOptions: IChartFilterOption[] = [
        {
            placeholder: 'Last Hour',
            unit: 'Mins',
            xaxisInterval: 5
        },
        {
            placeholder: 'Last 24 Hours',
            unit: 'Hours',
            xaxisInterval: 3
        },
        {
            placeholder: 'Last 7 Days',
            unit: 'Days',
            xaxisInterval: 0
        }
    ];
    const [currentChartFilterOption, setCurrentChartFilterOption] =
        useState<IChartFilterOption>(chartFilterOptions[1]);

    function convertArraytoGraphDataFormat(arr: number[]): ILineChartData[] {
        return arr.map((val, index) => ({
            name: index.toString(),
            amt: val
        }));
    }

    useEffect(() => {
        if (triggerHistoryMetric !== undefined) {
            switch (currentChartFilterOption.placeholder) {
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
    }, [currentChartFilterOption, triggerHistoryMetric]);

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
                                {currentChartFilterOption.placeholder}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
                                {chartFilterOptions.map(
                                    (item: IChartFilterOption, index) => (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setCurrentChartFilterOption({
                                                    placeholder: item.placeholder,
                                                    unit: item.unit,
                                                    xaxisInterval: item.xaxisInterval
                                                });
                                            }}
                                            key={index}
                                        >
                                            {item.placeholder}
                                        </DropdownMenuItem>
                                    )
                                )}
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
                            xaxisInterval={currentChartFilterOption.xaxisInterval}
                        />
                        <div className="mt-2 text-center">
                            Time ({currentChartFilterOption.unit})
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
}

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

    const [chartDataSource, setChartDataSource] = useState<
        { count: number; values: Record<string, number> }[]
    >([]);
    const chartFilterOptions: IChartFilterOption[] = [
        {
            placeholder: 'Last Hour',
            unit: 'Mins',
            xaxisInterval: 5
        },
        {
            placeholder: 'Last 24 Hours',
            unit: 'Hours',
            xaxisInterval: 2
        },
        {
            placeholder: 'Last 7 Days',
            unit: 'Days',
            xaxisInterval: 0
        }
    ];
    const [currentChartFilterOption, setCurrentChartFilterOption] =
        useState<IChartFilterOption>(chartFilterOptions[1]);

    function convertDicttoGraphDataFormat(
        arr: { count: number; values: Record<string, number> }[],
        chartUnit: string
    ): ILineChartData[] {
        let timeStampCalculator: (val: number) => string;
        let xAxisTickGenerator: (val: number) => string;

        switch (chartUnit) {
            case 'Mins':
                timeStampCalculator = (val: number) =>
                    new Date(Date.now() - val * 60000).toTimeString();
                xAxisTickGenerator = (val: number) => {
                    const date = new Date(Date.now() - val * 60000);
                    return (
                        appendZeroIfRequired(date.getHours()) +
                        ':' +
                        appendZeroIfRequired(date.getMinutes())
                    );
                };
                break;
            case 'Hours':
                timeStampCalculator = (val: number) =>
                    new Date(Date.now() - val * 3600000).toTimeString();
                xAxisTickGenerator = (val: number) => {
                    const date = new Date(Date.now() - val * 3600000);
                    return (
                        appendZeroIfRequired(date.getHours()) +
                        ':' +
                        appendZeroIfRequired(date.getMinutes())
                    );
                };
                break;
            case 'Days':
                timeStampCalculator = (val: number) =>
                    new Date(Date.now() - val * 86400000).toDateString();
                xAxisTickGenerator = (val: number) => {
                    const dateParts = new Date(Date.now() - val * 86400000)
                        .toDateString()
                        .split(' ');
                    return dateParts.slice(1, 3).join(' ');
                };
                break;
            default:
                throw new Error('Invalid chart unit');
        }

        return arr.map((item, index) => ({
            name: timeStampCalculator(index),
            amt: item.count,
            xaxisTick: xAxisTickGenerator(index),
            toolTipFooter: (
                <div>
                    {Object.entries(item.values).map(([key, value], valueIndex) => (
                        <div key={valueIndex}>
                            <span className="h-5 text-brand-Gray-50">
                                {key}(<span className="text-green-400">{value}</span>)
                            </span>
                        </div>
                    ))}
                </div>
            )
        }));
    }

    function appendZeroIfRequired(n: number) {
        return n.toString().length === 1 ? `0${n}` : n;
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
                                    ? convertDicttoGraphDataFormat(
                                          chartDataSource || [],
                                          currentChartFilterOption.unit
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

import React, { useState } from 'react';

import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useQuery } from '@tanstack/react-query';

import {
    IChartFilterOption,
    chartFilterOptions,
    convertDictToGraphDataFormat
} from '@app/components/Chart/ChartFilter';
import CustomLineChart, { ILineChartData } from '@app/components/Chart/CustomLineChart';
import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { cn } from '@app/components/lib/utils';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

interface IDataSource {
    placeholder: string;
    timeUnit: string;
    chartData: ILineChartData[];
    xAxisInterval: number;
}

export default function DashboardChart({ className }: { className?: string }) {
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
        <Card
            className={cn(
                'flex flex-row',
                className
            )}
        >
<span className="h4 hidden rotate-180 text-center [writing-mode:vertical-lr] md:block">
Transaction Volume
</span>
            <div className="w-full h-full flex flex-col md:pr-6 md:gap-y-8 gap-y-4">
                <div className="flex justify-between">
                    <span className="title-1 pl-4">Transactions</span>
                    {isLoading ? (
                        <Skeleton className="h-8 w-40" />
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                border={true}
                                className="hidden min-w-40 justify-between md:flex"
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
                <div className={"flex md:h-full w-full flex-col h-[180px] p-1"}>
                    {isLoading ? (
                        <Skeleton className="h-full w-full" />
                    ) : (
                        <>
                            <CustomLineChart
                                chartData={
                                    dataSources[currentChartFilterOption].chartData
                                }
                                xaxisInterval={
                                    dataSources[currentChartFilterOption].xAxisInterval
                                }
                            />
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}

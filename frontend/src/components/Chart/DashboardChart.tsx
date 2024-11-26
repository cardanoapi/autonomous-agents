import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import {
    chartFilterOptions,
    convertDictToGraphDataFormat,
    IChartFilterOption
} from '@app/components/Chart/ChartFilter';
import CustomLineChart, { ILineChartData } from '@app/components/Chart/CustomLineChart';
import { Card } from '@app/components/atoms/Card';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import {cn} from '@app/components/lib/utils'


interface IDataSource {
    placeholder: string;
    timeUnit: string;
    chartData: ILineChartData[];
    xAxisInterval: number;
}

export default function DashboardChart({className} : {className?: string}) {

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
        <Card className={cn("md:mt-4 flex flex-row gap-y-8 p-4 pb-12 2xl:mt-12 5xl:mt-16 pt-0 md:p-8 md:pb-16" , className)}>
    <span className="h4 rotate-180 text-center [writing-mode:vertical-lr] hidden md:block">
                    Transaction Volume
    </span>
    <div className="mt-5 w-full md:pr-6">
        <div className="flex justify-between">
            <span className="title-1">Transactions</span>

            {isLoading ? (
                <Skeleton className="h-8 w-40" />
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        border={true}
                        className="md:flex min-w-40 justify-between hidden"
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
        <div className="mt-2 md:h-[calc(100vh-490px)] pt-4 5xl:h-[calc(100vh-520px)] 5xl:pr-6 5xl:pt-12 h-[200px]">
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
                    />
                    <div className="mt-2 text-center text-sm md:text-base">
                        Time (
                        {dataSources[currentChartFilterOption].timeUnit})
                    </div>
                </>
            )}
        </div>
    </div>
</Card>
    )
}

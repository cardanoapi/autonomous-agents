'use client';

import { useEffect, useState } from 'react';

import { IAgent } from '@api/agents';
import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useQuery } from '@tanstack/react-query';

import CustomLineChart from '@app/components/Chart/CustomLineChart';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

import { IChartFilterOption, chartFilterOptions } from '../../Chart/ChartFilter';
import { convertDictToGraphDataFormat } from '../../Chart/ChartFilter';
import AgentFunctionsDropDown from '../../Common/AgentFunctionsDropDown';
import { cn } from '../../lib/utils';

const AgentHistoryChart = ({
    agent,
    chartClassName
}: {
    agent?: IAgent;
    chartClassName?: string;
}) => {
    const [currentChartFilterOption, setCurrentChartFilterOption] = useState(
        chartFilterOptions[2]
    );
    const [chartDataSource, setChartDataSource] = useState<
        { count: number; values: Record<string, number> }[]
    >([]);
    const {
        data: triggerHistoryMetric,
        isLoading: isLoading,
        refetch: refecthTriggerHistory
    } = useQuery({
        queryKey: [`${agent?.id}TriggerHistoryMetric`],
        queryFn: () =>
            fecthTriggerHistoryMetric(
                currentFunction === 'None' ? [] : [currentFunction],
                agent?.id
            )
    });

    const [currentFunction, setCurrentFunction] = useState('None');

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

    useEffect(() => {
        refecthTriggerHistory();
    }, [currentFunction]);

    return (
        <div
            className={cn(
                'flex h-full w-full flex-col gap-2 rounded border border-brand-border-100 p-4 lg:p-6 2xl:p-10',
                chartClassName
            )}
        >
            <div className="flex justify-between flex-wrap gap-2">
                <span className="md:title-1 h3 ">Transactions</span>
                <div className="hidden gap-2 md:flex">
                    <AgentFunctionsDropDown
                        onChange={(stringValue: string) => {
                            setCurrentFunction(stringValue);
                        }}
                        value={currentFunction === 'None' ? 'Function' : currentFunction}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            border={true}
                            className="flex justify-between md:min-w-40"
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
            </div>
            <div className="flex h-full w-full flex-col items-center justify-between gap-4 lg:p-2 2xl:p-8">
                <CustomLineChart
                    chartData={
                        triggerHistoryMetric !== undefined
                            ? convertDictToGraphDataFormat(
                                  chartDataSource || [],
                                  currentChartFilterOption.unit
                              )
                            : []
                    }
                    xaxisInterval={currentChartFilterOption.xaxisInterval}
                />
            </div>
        </div>
    );
};

export default AgentHistoryChart;

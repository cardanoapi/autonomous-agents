'use client';

import { useEffect, useState } from 'react';

import { IFunction, fetchFunctions } from '@api/functions';
import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useQuery } from '@tanstack/react-query';

import { IAgent } from '@app/app/api/agents';
import CustomLineChart from '@app/components/Chart/CustomLineChart';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

import { IChartFilterOption, chartFilterOptions } from '../Chart/ChartFilter';
import { convertDictToGraphDataFormat } from '../Chart/ChartFilter';

const AgentHistoryComponent = ({ agent }: { agent?: IAgent }) => {
    const [currentChartFilterOption, setCurrentChartFilterOption] = useState(
        chartFilterOptions[1]
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
    const { data: agentFunctions = [] } = useQuery({
        queryKey: ['AgentFunctions'],
        queryFn: fetchFunctions
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

    if (isLoading)
        return (
            <div className={'flex h-full w-full flex-col gap-10'}>
                <Skeleton className={'h-5 w-[300px]'} />
                <Skeleton className={'h-full w-full'} />
            </div>
        );
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Agent History</span>
            </div>
            <div
                className={
                    'flex h-full w-full flex-col gap-2 rounded border border-brand-White-200 p-4'
                }
            >
                <div className="flex justify-between">
                    <span className="title-1">Transactions</span>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                border={true}
                                className="flex w-72 justify-between"
                            >
                                {currentFunction === 'None'
                                    ? 'Function'
                                    : currentFunction}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
                                <DropdownMenuItem
                                    onClick={() => setCurrentFunction('None')}
                                >
                                    All
                                </DropdownMenuItem>
                                {agentFunctions?.map(
                                    (agentFunction: IFunction, index) => (
                                        <DropdownMenuItem
                                            key={index}
                                            onClick={() =>
                                                setCurrentFunction(
                                                    agentFunction.function_name
                                                )
                                            }
                                        >
                                            {agentFunction.function_name}
                                        </DropdownMenuItem>
                                    )
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                </div>
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
                <div className="mt-2 text-center">
                    Time ({currentChartFilterOption.unit})
                </div>
            </div>
        </div>
    );
};

export default AgentHistoryComponent;

'use client';

import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { IAgent } from '@app/app/api/agents';
import { fetchTransactionCountOfAgentById } from '@app/app/api/triggerHistory';
import CustomLineChart, { ILineChartData } from '@app/components/Chart/CustomLineChart';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { getFilteredData } from '@app/utils/dashboard';

const AgentHistoryComponent = ({ agent }: { agent?: IAgent }) => {
    const [currentChartFilter, setCurrentChartFilter] = useState('Last 24 Hours');
    const [filteredChartData, setFilteredChartData] = useState<ILineChartData[]>([]);

    const { data: agentTransactionCount, isLoading } = useQuery<any>({
        queryKey: [`agentTriggerHistory${agent?.id}`],
        queryFn: () => fetchTransactionCountOfAgentById(agent?.id || '')
    });

    useEffect(() => {
        const filteredData = agentTransactionCount
            ? getFilteredData(agentTransactionCount, currentChartFilter)
            : [];
        setFilteredChartData(filteredData);
    }, [currentChartFilter, agentTransactionCount]);

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
                <div>
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
                </div>
                <CustomLineChart chartData={filteredChartData} />
            </div>
        </div>
    );
};

export default AgentHistoryComponent;

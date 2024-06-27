'use client';

import { useEffect, useState } from 'react';

import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useQuery } from '@tanstack/react-query';

import { IFunction, fetchFunctions } from '@app/app/api/functions';
import {
    IAgentTriggerHistory,
    fetchAllTriggerHistory
} from '@app/app/api/triggerHistory';
import { AgentLogCard } from '@app/components/Agent/AgentLog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { SearchField } from '@app/components/atoms/SearchField';

export default function LogsPage() {
    const { data: LogsHistory } = useQuery({
        queryKey: ['LogsHistory'],
        queryFn: fetchAllTriggerHistory
    });
    const { data: agentFunctions = [] } = useQuery({
        queryKey: ['AgentFunctions'],
        queryFn: fetchFunctions
    });

    const [statusFilter, setStatusFilter] = useState('Filter');
    const [searchKeywordFilter, setSearchKeywordFilter] = useState('');
    const [functionFilter, setFunctionFilter] = useState('Function');
    const [filteredLogs, setFilteredLogs] = useState<IAgentTriggerHistory[]>([]);
    const statusOptions = ['Success', 'Skipped', 'Failed'];

    useEffect(() => {
        if (LogsHistory?.items) {
            let newLogs = LogsHistory?.items;
            // Apply if any of the filtering options are active
            if (searchKeywordFilter.length !== 0) {
                newLogs = filterbyAgentID(newLogs);
            }
            if (functionFilter !== 'Function') {
                newLogs = filterbyFunction(newLogs);
                console.log('Current function filter', functionFilter);
                console.log('Logs After function filter', newLogs);
            }
            if (statusFilter !== 'Filter') {
                console.log('Logs before status filter', newLogs);
                newLogs = filterbyStatus(newLogs);
                console.log('logs after status filter', newLogs);
            }
            console.log('final logs', newLogs);
            setFilteredLogs(newLogs);
        }
    }, [searchKeywordFilter, functionFilter, statusFilter, LogsHistory]);

    function filterbyStatus(sourceLogs: IAgentTriggerHistory[]) {
        let newLogs;
        switch (statusFilter) {
            case 'Success':
                newLogs = sourceLogs.filter(
                    (history: IAgentTriggerHistory) =>
                        history.status === true && history.success === true
                );
                break;
            case 'Skipped':
                newLogs = sourceLogs.filter(
                    (history: IAgentTriggerHistory) =>
                        history.status === false && history.success === false
                );
                break;
            case 'Failed':
                newLogs = sourceLogs.filter(
                    (history: IAgentTriggerHistory) =>
                        history.status === true && history.success === false
                );
                break;
            default:
                break;
        }
        return newLogs;
    }

    function filterbyAgentID(sourceLogs: IAgentTriggerHistory[]) {
        const newLogs = sourceLogs.filter((history: IAgentTriggerHistory) =>
            history.agentId.includes(searchKeywordFilter)
        );
        return newLogs;
    }

    //TODO : Implement function filtering using the Backend API directly instead of filtering here.
    function filterbyFunction(sourceLogs: IAgentTriggerHistory[]) {
        const newLogs = sourceLogs.filter(
            (history: IAgentTriggerHistory) => history.functionName === functionFilter
        );
        return newLogs;
    }

    function applyStatusFilter(status: string) {
        setStatusFilter(status === 'None' ? 'Filter' : status);
    }

    function applyFunctionFilter(filter: string) {
        setFunctionFilter(filter === 'All' ? 'Function' : filter);
    }

    function handleSearch(targetAgentID: string) {
        setSearchKeywordFilter(targetAgentID);
    }

    return (
        <div>
            <div className="flex gap-2">
                <SearchField
                    placeholder="Search Agent ID"
                    variant="secondary"
                    onSearch={handleSearch}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger border={true}>
                        {functionFilter}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white">
                        <DropdownMenuItem onClick={() => applyFunctionFilter('All')}>
                            All
                        </DropdownMenuItem>
                        {agentFunctions?.map((agentFunction: IFunction, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() =>
                                    applyFunctionFilter(agentFunction.function_name)
                                }
                            >
                                {agentFunction.function_name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger border={true}>
                        Status : <span className="w-16">{statusFilter}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white">
                        <DropdownMenuItem onClick={() => applyStatusFilter('None')}>
                            All
                        </DropdownMenuItem>
                        {statusOptions.map((status: string, index) => (
                            <DropdownMenuItem
                                onClick={() => applyStatusFilter(status)}
                                key={index}
                            >
                                {status}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="mt-8">
                <div className={'flex h-full w-full flex-col gap-10'}>
                    <ScrollArea
                        className={'h-agentComponentHeight overflow-y-auto pr-4'}
                    >
                        <div className={'grid grid-cols-1 gap-2'}>
                            {filteredLogs.map((history, index) => (
                                <AgentLogCard history={history} key={index} />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

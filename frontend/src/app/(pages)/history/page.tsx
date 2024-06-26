'use client';

import { useEffect, useState } from 'react';

import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useQuery } from '@tanstack/react-query';

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

    const [statusFilter, setStatusFilter] = useState('Filter');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredLogs, setFilteredLogs] = useState<IAgentTriggerHistory[]>([]);

    function filterbyLogStatus(
        targetStatus: string,
        sourceLogs: IAgentTriggerHistory[]
    ) {
        let newLogs = sourceLogs;
        switch (statusFilter) {
            case 'Success':
                newLogs = LogsHistory.items.filter(
                    (history: IAgentTriggerHistory) =>
                        history.status === true && history.success === true
                );
                break;
            case 'Skipped':
                newLogs = LogsHistory.items.filter(
                    (history: IAgentTriggerHistory) =>
                        history.status === false && history.success === false
                );
                break;
            case 'Failed':
                newLogs = LogsHistory.items.filter(
                    (history: IAgentTriggerHistory) =>
                        history.status === true && history.success === false
                );
                break;
            default:
                break;
        }
        return newLogs;
    }

    function filterbyAgentID(
        targetAgentID: string,
        sourceLogs: IAgentTriggerHistory[]
    ) {
        const newLogs = sourceLogs.filter((history: IAgentTriggerHistory) =>
            history.agentId.includes(targetAgentID)
        );
        return newLogs;
    }

    function applyStatusFilter(status: string) {
        setStatusFilter(status === 'None' ? 'Filter' : status);
    }

    function handleSearch(targetAgentID: string) {
        setSearchKeyword(targetAgentID);
    }
    useEffect(() => {
        if (LogsHistory?.items) {
            let newLogs = LogsHistory?.items;

            // Check if any filtering options are active
            if (statusFilter !== 'Filter') {
                newLogs = filterbyLogStatus(statusFilter, newLogs);
            }
            if (searchKeyword.length !== 0) {
                newLogs = filterbyAgentID(searchKeyword, newLogs);
            }
            setFilteredLogs(newLogs);
        }
    }, [statusFilter, LogsHistory, searchKeyword]);

    return (
        <div>
            <div className="flex gap-2">
                <SearchField
                    placeholder="Search Agent ID"
                    variant="secondary"
                    onSearch={handleSearch}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger border={true}>Function</DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white">
                        <DropdownMenuItem>Send Ada</DropdownMenuItem>
                        <DropdownMenuItem>Vote Proposal</DropdownMenuItem>
                        <DropdownMenuItem>Others</DropdownMenuItem>
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
                        <DropdownMenuItem onClick={() => applyStatusFilter('Success')}>
                            Success
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyStatusFilter('Skipped')}>
                            Skipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyStatusFilter('Failed')}>
                            Failed
                        </DropdownMenuItem>
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

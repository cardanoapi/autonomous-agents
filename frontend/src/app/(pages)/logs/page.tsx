'use client';

import { useEffect, useState } from 'react';

import { IAgentTriggerHistory, fetchAllTriggerHistory } from '@api/triggerHistory';
import { useQuery } from '@tanstack/react-query';

import {
    AgentLogCard,
    AgentLogCardSkeleton
} from '@app/components/Agent/AgentContent/Logs';
import AgentFunctionsDropDown from '@app/components/Common/AgentFunctionsDropDown';
import { Badge } from '@app/components/atoms/Badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { SearchField } from '@app/components/atoms/SearchField';
import PaginationBtns from '@app/components/molecules/PaginationBtns';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';

export default function LogsPage() {
    // Object to store all state related to the query
    const [logQueryState, setLogQueryState] = useState({
        currentPage: 1,
        currentResponseSize: 50,
        currentStatus: 'None',
        currentSuccess: 'None',
        currentFunction: 'None',
        currentAgentID: 'None',
        totalPages: 1,
        statusPlaceholder: 'None'
    });

    const statusOptions = ['Success', 'Skipped', 'Failed'];

    const {
        data: LogsHistory,
        refetch: refetchLogsHistory,
        isLoading: loadingLogs
    } = useQuery({
        queryKey: [
            'LogsHistory',
            logQueryState.currentPage,
            logQueryState.currentResponseSize,
            logQueryState.currentAgentID,
            logQueryState.currentFunction,
            logQueryState.currentStatus,
            logQueryState.currentSuccess
        ],
        queryFn: fetchAllTriggerHistory
    });

    useEffect(() => {
        refetchLogsHistory();
    }, [
        logQueryState.currentPage,
        logQueryState.currentFunction,
        logQueryState.currentStatus,
        logQueryState.currentSuccess,
        logQueryState.currentAgentID,
        logQueryState.currentResponseSize
    ]);

    useEffect(() => {
        if (LogsHistory) {
            setLogQueryState((prevState) => ({
                ...prevState,
                totalPages: LogsHistory.pages
            }));
            if (LogsHistory.pages < logQueryState.currentPage) {
                setLogQueryState((prevState) => ({
                    ...prevState,
                    currentPage: 1
                }));
            }
        }
    }, [LogsHistory]);

    function handleStatusChange(status: string) {
        if (status === logQueryState.statusPlaceholder) {
            setLogQueryState((prevState) => ({
                ...prevState,
                statusPlaceholder: 'None',
                currentStatus: 'None',
                currentSuccess: 'None'
            }));
            refetchLogsHistory();
            return;
        }

        let newStatus = 'None';
        let newSuccess = 'None';

        switch (status) {
            case 'Success':
                newStatus = 'True';
                newSuccess = 'True';
                break;
            case 'Skipped':
                newStatus = 'False';
                newSuccess = 'False';
                break;
            case 'Failed':
                newStatus = 'True';
                newSuccess = 'False';
                break;
        }

        setLogQueryState((prevState) => ({
            ...prevState,
            statusPlaceholder: status,
            currentStatus: newStatus,
            currentSuccess: newSuccess,
            currentPage: 1
        }));
    }

    const TopNav = () => {
        const rowOptions = [10, 30, 50, 100];

        return (
            <div className="flex items-center justify-between ">
                <div className="flex gap-2">
                    <SearchField
                        placeholder="Enter Agent ID"
                        variant="secondary"
                        onSearch={(val: string) => {
                            setLogQueryState((prevState) => ({
                                ...prevState,
                                currentAgentID: val
                            }));
                        }}
                    />
                    <AgentFunctionsDropDown
                        onChange={(strValue: string) => {
                            setLogQueryState((prevState) => ({
                                ...prevState,
                                currentFunction: strValue
                            }));
                        }}
                    />
                    <div className="flex justify-center gap-2">
                        {statusOptions.map((status: string, index) => (
                            <Badge
                                key={index}
                                variant={
                                    logQueryState.statusPlaceholder === status
                                        ? 'successPrimary'
                                        : 'primary'
                                }
                                className="flex w-20 justify-center"
                                onClick={() => handleStatusChange(status)}
                            >
                                {status}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="flex">
                    <span>Rows per page :</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <span className="ml-1 w-6">
                                {logQueryState.currentResponseSize}
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="!min-w-0">
                            {rowOptions.map((row: number, index) => (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={() => {
                                        setLogQueryState((prevState) => ({
                                            ...prevState,
                                            currentResponseSize: row
                                        }));
                                    }}
                                >
                                    {row}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col justify-between ">
            <div className="flex flex-grow flex-col">
                <TopNav />
                <div className="mt-6 flex-grow">
                    <ScrollArea className="flex h-logsPageHeight max-h-logsList flex-col overflow-y-auto pr-4">
                        {loadingLogs
                            ? Array.from({ length: 50 }).map((_, index) => (
                                  <AgentLogCardSkeleton key={index} className="my-2" />
                              ))
                            : LogsHistory?.items.length > 0 &&
                              LogsHistory.items.map(
                                  (history: IAgentTriggerHistory, index: number) => (
                                      <AgentLogCard
                                          history={history}
                                          key={index}
                                          className="my-2 flex bg-white"
                                          globalLog
                                      />
                                  )
                              )}
                    </ScrollArea>
                </div>
            </div>
            <div className="flex flex-row-reverse pt-4">
                <PaginationBtns
                    className="pagination-btn-position flex justify-center"
                    onPaginate={(val: number) => {
                        setLogQueryState((prevState) => ({
                            ...prevState,
                            currentPage: prevState.currentPage + val
                        }));
                    }}
                    refCurrentPage={logQueryState.currentPage}
                    upperLimit={logQueryState.totalPages}
                />
            </div>
        </div>
    );
}

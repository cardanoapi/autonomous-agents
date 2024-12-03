'use client';

import { useEffect, useState } from 'react';

import { IAgentTriggerHistory, fetchAllTriggerHistory } from '@api/triggerHistory';
import { useQuery } from '@tanstack/react-query';

import DataActionBar from '@app/app/components/DataActionBar';
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
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import EmptyScreen from '@app/components/molecules/EmptyScreen';

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
            <div className="flex items-center justify-between w-full flex-wrap gap-y-2">
                <div className="flex flex-col gap-2 md:flex-row flex-wrap items-center">
                    <DataActionBar
                        placeholder="Search Log by Agent ID"
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
                        className="hidden md:flex"
                    />
                    <div className="hidden justify-center gap-2 md:flex">
                        {statusOptions.map((status: string, index) => (
                            <Badge
                                key={index}
                                variant={
                                    logQueryState.statusPlaceholder === status
                                        ? 'successPrimary'
                                        : 'primary'
                                }
                                className="flex w-20 justify-center h-8"
                                onClick={() => handleStatusChange(status)}
                            >
                                {status}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="hidden md:flex">
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
        <>
            <TopNav />
            {
                loadingLogs && <Skeleton className='w-full h-full'/>
            }
            {
                !loadingLogs && LogsHistory?.items.length === 0 &&
                <EmptyScreen msg="No logs found"/>
            }
            {
                !loadingLogs && LogsHistory?.items.length > 0 &&
                <div className="flex w-full h-full  flex-col overflow-y-auto md:pr-4">{
                                LogsHistory.items.map(
                                    (history: IAgentTriggerHistory, index: number) => (
                                        <AgentLogCard
                                            history={history}
                                            key={index}
                                            className="my-2 flex bg-white h-fit"
                                            globalLog={true}
                                        />
                                    )
                                )}
                </div>
            }
            <div className="flex flex-row-reverse ">
                <PaginationBtns
                    className="flex justify-center"
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
        </>
    );
}

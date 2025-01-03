'use client';

import { useEffect, useState } from 'react';

import { IAgentTriggerHistory, fetchAllTriggerHistory } from '@api/triggerHistory';
import { useQuery } from '@tanstack/react-query';

import DataActionBar from '@app/app/components/DataActionBar';
import { AgentLogCard } from '@app/components/Agent/AgentContent/Logs';
import AgentFunctionsDropDown from '@app/components/Common/AgentFunctionsDropDown';
import { Badge } from '@app/components/atoms/Badge';
import { cn } from '@app/components/lib/utils';
import EmptyScreen from '@app/components/molecules/EmptyScreen';
import PaginationBtns from '@app/components/molecules/PaginationBtns';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

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
        return (
            <div className="flex flex-col gap-2 md:flex-row">
                <div>
                    <DataActionBar
                        placeholder="Search Log by Agent ID"
                        onSearch={(val: string) => {
                            setLogQueryState((prevState) => ({
                                ...prevState,
                                currentAgentID: val
                            }));
                        }}
                    />
                </div>
                <AgentFunctionsDropDown
                    onChange={(strValue: string) => {
                        setLogQueryState((prevState) => ({
                            ...prevState,
                            currentFunction: strValue
                        }));
                    }}
                    className="hidden w-64 md:flex"
                    value={logQueryState.currentFunction == 'None' ? 'Function' : logQueryState.currentFunction}
                />
                <div className="hidden items-center justify-center gap-2 md:flex">
                    {statusOptions.map((status: string, index) => (
                        <Badge
                            key={index}
                            variant={logQueryState.statusPlaceholder === status ? 'successPrimary' : 'primary'}
                            className="flex h-8 w-20 justify-center"
                            onClick={() => handleStatusChange(status)}
                        >
                            {status}
                        </Badge>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <TopNav />
            {loadingLogs && <Skeleton className="h-full w-full" />}
            {!loadingLogs && LogsHistory?.items.length === 0 && <EmptyScreen msg="No logs found" />}
            {!loadingLogs && LogsHistory?.items.length > 0 && (
                <div className="flex h-full w-full flex-col overflow-y-auto md:pr-4">
                    {LogsHistory.items.map((history: IAgentTriggerHistory, index: number) => (
                        <AgentLogCard
                            history={history}
                            key={index}
                            className="my-1 flex h-fit bg-white"
                            globalLog={true}
                        />
                    ))}
                </div>
            )}
            <div className={cn('flex flex-row-reverse', LogsHistory?.items.length === 0 && 'hidden')}>
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
                    rowsLabel={'Logs per page'}
                    rowOptions={[10, 15, 20, 30]}
                    onRowClick={(val: number) => {
                        setLogQueryState((prevState) => ({
                            ...prevState,
                            currentResponseSize: val
                        }));
                    }}
                    rowsPerPage={logQueryState.currentResponseSize}
                />
            </div>
        </>
    );
}

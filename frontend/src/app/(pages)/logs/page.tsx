'use client';

import { useEffect, useState } from 'react';

import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useQuery } from '@tanstack/react-query';

import {
    IAgentTriggerHistory,
    fetchAllTriggerHistory
} from '@app/app/api/triggerHistory';
import { EmptyLogsPlaceholder } from '@app/components/Agent/AgentLog';
import { AgentLogCard } from '@app/components/Agent/AgentLog';
import AgentFunctionsDropDown from '@app/components/Common/AgentFunctionsDropDown';
import { Badge } from '@app/components/atoms/Badge';
import { SearchField } from '@app/components/atoms/SearchField';
import PaginationBtns from '@app/components/molecules/PaginationBtns';

export default function LogsPage() {
    //Related to Log query
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentResponseSize, setCurrentResponseSize] = useState<number>(50);
    const [currentStatus, setCurrentStatus] = useState<string>('None');
    const [currentSuccess, setCurrentSucccess] = useState<string>('None');
    const [currentFunction, setCurrentFunction] = useState('None');
    const [currentAgentID, setCurrentAgentID] = useState('None');
    const [totalPages, setTotalPages] = useState<number>(1);

    const statusOptions = ['Success', 'Skipped', 'Failed'];
    const [statusPlaceholder, setStatusPlaceholder] = useState('None');

    const {
        data: LogsHistory,
        refetch: refetchLogsHistory,
        isLoading: loadingLogs
    } = useQuery({
        queryKey: [
            'LogsHistory',
            currentPage,
            currentResponseSize,
            currentAgentID,
            currentFunction,
            currentStatus,
            currentSuccess
        ],
        queryFn: fetchAllTriggerHistory
    });

    useEffect(() => {
        refetchLogsHistory();
    }, [currentPage, currentFunction, currentStatus, currentSuccess, currentAgentID]);

    useEffect(() => {
        LogsHistory ? setTotalPages(LogsHistory.pages) : {};
        if (LogsHistory && LogsHistory.pages < currentPage) {
            setCurrentPage(1);
        }
    }, [LogsHistory]);

    useEffect(() => {
        // For Dynamic Pagination Response Count
        function updateResponseSize() {
            const clientHeight = window.innerHeight;
            const calculatedResponseSize = Math.floor(clientHeight / 100);
            setCurrentResponseSize(calculatedResponseSize);
        }
        updateResponseSize();
        window.addEventListener('resize', updateResponseSize);
        return () => {
            window.removeEventListener('resize', updateResponseSize);
        };
    }, []);

    function handleStatusChange(status: string) {
        if (status === statusPlaceholder) {
            setStatusPlaceholder('None');
            setCurrentStatus('None');
            setCurrentSucccess('None');
            refetchLogsHistory();
            return;
        }
        switch (status) {
            case 'None':
                setCurrentStatus('None');
                setCurrentSucccess('None');
                break;
            case 'Success':
                setCurrentStatus('True');
                setCurrentSucccess('True');
                break;
            case 'Skipped':
                setCurrentStatus('False');
                setCurrentSucccess('False');
                break;
            case 'Failed':
                setCurrentStatus('True');
                setCurrentSucccess('False');
                break;
        }
        setStatusPlaceholder(status);
        setCurrentPage(1);
    }

    const TopNav = () => {
        return (
            <div className="flex items-center justify-between ">
                <div className="flex gap-2">
                    <SearchField
                        placeholder="Enter Agent ID"
                        variant="secondary"
                        onSearch={(val: string) => {
                            setCurrentAgentID(val);
                        }}
                    />
                    <AgentFunctionsDropDown
                        onChange={(strValue: string) => {
                            setCurrentFunction(strValue);
                        }}
                    />
                    <div className="flex justify-center gap-2">
                        {statusOptions.map((status: string, index) => (
                            <Badge
                                key={index}
                                variant={
                                    statusPlaceholder === status
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
                <PaginationBtns
                    className="pr-4"
                    onPaginate={(val: number) => {
                        const newVal = currentPage + val;
                        setCurrentPage(newVal);
                    }}
                    refCurrentPage={currentPage}
                    upperLimit={totalPages}
                />
            </div>
        );
    };

    return (
        <div style={{ height: 'calc(100vh - 200px)' }} className="flex flex-col">
            <TopNav />
            <div className="mt-8">
                <div className={'flex h-full w-full flex-col gap-10'}>
                    <ScrollArea
                        className={'h-agentComponentHeight overflow-y-auto pr-4'}
                    >
                        <div className="grid grid-cols-1 gap-2">
                            {LogsHistory?.items.length > 0 &&
                                LogsHistory.items.map(
                                    (history: IAgentTriggerHistory, index: number) => (
                                        <AgentLogCard
                                            history={history}
                                            key={index}
                                            className="bg-white"
                                            globalLog
                                        />
                                    )
                                )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
            {!loadingLogs && LogsHistory?.items.length === 0 && (
                <EmptyLogsPlaceholder />
            )}
        </div>
    );
}

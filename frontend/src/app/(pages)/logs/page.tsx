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
import PaginationBtns from '@app/components/molecules/PaginationBtns';

export default function LogsPage() {
    //Related to Log query
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentResponseSize, setCurrentResponseSize] = useState<number>(8);
    const [currentStatus, setCurrentStatus] = useState<string>('None');
    const [currentSuccess, setCurrentSucccess] = useState<string>('None');
    const [currentFunction, setCurrentFunction] = useState('None');
    const [currentAgentID, setCurrentAgentID] = useState('None');
    const [totalPages, setTotalPages] = useState<number>(1);

    const statusOptions = ['Success', 'Skipped', 'Failed'];
    const [statusPlaceholder, setStatusPlaceholder] = useState('None');

    const { data: LogsHistory, refetch: refetchLogsHistory } = useQuery({
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
    const { data: agentFunctions = [] } = useQuery({
        queryKey: ['AgentFunctions'],
        queryFn: fetchFunctions
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
        console.log(currentPage);
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <SearchField
                        placeholder="Enter Agent ID"
                        variant="secondary"
                        onSearch={(val: string) => {
                            setCurrentAgentID(val);
                        }}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger border={true}>
                            {currentFunction === 'None' ? 'Function' : currentFunction}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                            <DropdownMenuItem
                                onClick={() => setCurrentFunction('None')}
                            >
                                All
                            </DropdownMenuItem>
                            {agentFunctions?.map((agentFunction: IFunction, index) => (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={() =>
                                        setCurrentFunction(agentFunction.function_name)
                                    }
                                >
                                    {agentFunction.function_name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger border={true}>
                            Status :{' '}
                            <span className="w-16">
                                {statusPlaceholder === 'None'
                                    ? 'Filter'
                                    : statusPlaceholder}
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                            <DropdownMenuItem
                                onClick={() => handleStatusChange('None')}
                            >
                                All
                            </DropdownMenuItem>
                            {statusOptions.map((status: string, index) => (
                                <DropdownMenuItem
                                    onClick={() => handleStatusChange(status)}
                                    key={index}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
            <div className="mt-8">
                <div className={'flex h-full w-full flex-col gap-10'}>
                    <ScrollArea
                        className={'h-agentComponentHeight overflow-y-auto pr-4'}
                    >
                        <div className={'grid grid-cols-1 gap-2'}>
                            {LogsHistory?.items.map(
                                (history: IAgentTriggerHistory, index: number) => (
                                    <AgentLogCard
                                        history={history}
                                        key={index}
                                        className="bg-white"
                                    />
                                )
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

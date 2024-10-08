'use client';

import { useState } from 'react';
import React from 'react';

import { IAgent } from '@api/agents';
import { IAgentTriggerHistory, fetchAllTriggerHistory } from '@api/triggerHistory';
import { MapFunctionNameAndViewName } from '@consts';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { Copy, OctagonAlert } from 'lucide-react';

import AgentAvatar from '@app/components/Agent/AgentAvatar';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { agentsAtom } from '@app/store/localStore';
import { Truncate } from '@app/utils/common/extra';
import { formatTimestamp } from '@app/utils/dateAndTimeUtils';

import AgentFunctionsDropDown from '../Common/AgentFunctionsDropDown';
import { Badge } from '../atoms/Badge';
import { cn } from '../lib/utils';
import { ScrollArea } from '../shadcn/ui/scroll-area';
import { Skeleton } from '../shadcn/ui/skeleton';
import ErrorPlaceholder from './ErrorPlaceholder';

const AgentLogComponent = ({ agent }: { agent?: IAgent }) => {
    const statusOptions = ['Success', 'Skipped', 'Failed'];
    const [statusPlaceholder, setStatusPlaceholder] = useState('None');
    const [currentFunction, setCurrentFunction] = useState('None');
    const [currentStatus, setCurrentStatus] = useState('None');
    const [currentSuccess, setCurrentSucccess] = useState('None');

    const {
        data: LogsHistory,
        refetch: refetchLogsHistory,
        isLoading: loadingLogs
    } = useQuery({
        queryKey: [
            `${agent?.id}LogsHistory`,
            1,
            50,
            agent?.id,
            currentFunction,
            currentStatus,
            currentSuccess
        ],
        queryFn: fetchAllTriggerHistory,
        refetchInterval: 60000,
        refetchOnWindowFocus: true,
        refetchOnMount: true
    });

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
    }
    return (
        <div className={'flex h-full w-full flex-col gap-4'}>
            <div className="flex justify-end gap-4 pr-4 ">
                <AgentFunctionsDropDown
                    onChange={(strVal: string) => {
                        setCurrentFunction(strVal);
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
            <ScrollArea className={'max-h-agentComponentHeight overflow-y-auto pr-4'}>
                <div className="grid grid-cols-1 gap-2">
                    {loadingLogs
                        ? Array.from({ length: 50 }).map((_, index) => (
                              <AgentLogCardSkeleton key={index} />
                          ))
                        : LogsHistory?.items.length > 0 &&
                          LogsHistory.items.map(
                              (history: IAgentTriggerHistory, index: number) => (
                                  <AgentLogCard
                                      history={history}
                                      key={index}
                                      className="bg-gray-100"
                                  />
                              )
                          )}
                </div>
            </ScrollArea>
            {!loadingLogs && LogsHistory?.items.length === 0 && (
                <div className="flex flex-grow">
                    <ErrorPlaceholder icon={OctagonAlert} title="No Logs Found" content='Logs are Empty.' className='border-0'/>
                </div>
            )}
        </div>
    );
};

export const AgentLogCard = ({
    history,
    className,
    globalLog = false
}: {
    history: IAgentTriggerHistory;
    className?: string;
    globalLog?: boolean;
}) => {
    const [agents] = useAtom(agentsAtom);
    function getAgentExecutionStatus() {
        if (!history.status) return 'Skipped';
        else if (history.success) return 'Success';
        else return 'Failed';
    }

    function getBadgeVariant() {
        if (!history.status) return 'default';
        else if (history.success) return 'success';
        else return 'destructive';
    }

    return (
        <div
            className={cn(
                `flex h-fit flex-row justify-between gap-4 rounded-lg bg-gray-100 px-3 py-2 drop-shadow-sm hover:bg-gray-200
                `,
                className
            )}
        >
            <div className={'row flex  items-start gap-8 '}>
                {globalLog && (
                    <div className={'flex items-center gap-3 sm:min-w-[200px]'}>
                        <AgentAvatar
                            activeStatus={false}
                            hash={history.agentId}
                            size={20}
                            isActive={false}
                            isLink
                        />
                        <div className="card-h2 flex flex-col ">
                            <span className={'text-sm leading-normal'}>
                                {Truncate(
                                    (agents &&
                                        agents[history.agentId] &&
                                        agents[history.agentId].name) ||
                                        '',
                                    20
                                )}
                                &nbsp; #{history.instanceIndex}
                            </span>
                            <span
                                className={
                                    'text-[10px] leading-normal text-brand-Black-300/80'
                                }
                            >
                                {Truncate(history.agentId || '', 25)}
                            </span>
                        </div>
                    </div>
                )}
                {!globalLog && (
                    <div>
                        <span className={'text-sm font-medium'}>
                            #{history.instanceIndex}
                        </span>
                    </div>
                )}
                <div className={'flex flex-col items-start gap-2'}>
                    <div className={'flex flex-row items-center gap-1'}>
                        <span className={'text-sm font-medium'}>
                            {MapFunctionNameAndViewName[history.functionName] ||
                                history.functionName}
                        </span>
                        <span className={'rounded bg-blue-200 p-1 text-[8px]'}>
                            {history.triggerType || 'CRON'}
                        </span>
                    </div>
                    {history.message && (
                        <span className={'text-xs'}>{history.message}</span>
                    )}
                    {history.txHash && <TxHashComponent txHash={history.txHash} />}
                </div>
            </div>
            <div
                className={
                    ' flex min-w-fit flex-col items-end justify-start gap-1 md:min-w-[200px]'
                }
            >
                <Badge variant={getBadgeVariant()}>{getAgentExecutionStatus()}</Badge>
                <span className={'text-xs'}>{formatTimestamp(history.timestamp)}</span>
            </div>
        </div>
    );
};

const TxHashComponent = ({ txHash }: { txHash: string }) => {
    const handleOnClickCopy = () => {
        navigator.clipboard.writeText(txHash);
        SuccessToast('Transaction Hash Copied!');
    };
    return (
        <>
            <div
                className={
                    'flex flex-row items-center gap-1 truncate text-sm font-medium '
                }
            >
                <h1>TxHash :</h1>
                <span
                    onClick={handleOnClickCopy}
                    className={
                        'cursor-pointer text-xs text-brand-Black-300/90 hover:!text-brand-Black-300/60 ' +
                        'w-[120px] truncate sm:w-[200px] lg:w-[350px]'
                    }
                >
                    {txHash}
                </span>
                <Copy
                    color="#A1A1A1"
                    className=" h-4 w-4 hover:cursor-pointer"
                    onClick={handleOnClickCopy}
                />
            </div>
        </>
    );
};

export default AgentLogComponent;


export const AgentLogCardSkeleton = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                'flex h-fit flex-row justify-between gap-4 rounded-lg bg-gray-100 px-3 py-3 drop-shadow-sm hover:bg-gray-200',
                className
            )}
        >
            <div className="flex items-start gap-8">
                <div className="flex items-center gap-3 sm:min-w-[200px]">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex flex-col">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="mt-1 h-3 w-48 rounded" />
                    </div>
                </div>
                <div className="flex flex-col items-start gap-2">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="mt-1 h-3 w-64 rounded" />
                </div>
            </div>
            <div className="flex min-w-fit flex-col items-end justify-start gap-1 md:min-w-[200px]">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="mt-1 h-3 w-20 rounded" />
            </div>
        </div>
    );
};

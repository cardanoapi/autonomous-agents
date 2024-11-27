'use client';

import React, { useState } from 'react';

import { IAgent } from '@api/agents';
import { IAgentTriggerHistory, fetchAllTriggerHistory } from '@api/triggerHistory';
import { MapFunctionNameAndViewName } from '@consts';
import { useQuery } from '@tanstack/react-query';
import { formatParameterName } from '@utils';
import { useAtom } from 'jotai';
import { Copy } from 'lucide-react';

import AgentAvatar from '@app/components/Agent/shared/AgentAvatar';
import AgentsIcon from '@app/assets/icons/AgentsIcon';
import { useCopyClipboard } from '@app/lib/hooks/useCopyToClipboard';
import { agentsAtom } from '@app/store/localStore';
import { Truncate } from '@app/utils/common/extra';
import { formatTimestamp } from '@app/utils/dateAndTimeUtils';

import AgentFunctionsDropDown from '../../Common/AgentFunctionsDropDown';
import { Badge } from '../../atoms/Badge';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../shadcn/ui/skeleton';
import ErrorPlaceholder from '../shared/ErrorPlaceholder';
import ContentHeader from './ContentHeader';

export const AgentLogComponent = ({ agent }: { agent?: IAgent }) => {
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
            <ContentHeader>
                <div className="flex justify-end gap-4 pr-4 ">
                    <AgentFunctionsDropDown
                        onChange={(strVal: string) => {
                            setCurrentFunction(strVal);
                        }}
                    />
                    <div className="justify-center gap-2 hidden md:flex">
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
            </ContentHeader>
            <div className="md:mt-4 grid grid-cols-1 gap-2">
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
            {!loadingLogs && LogsHistory?.items.length === 0 && (
                <ErrorPlaceholder
                    className="absolute mt-4 h-full w-full border-0"
                    title="No Matching logs found"
                    content="Try changing the filters"
                    icon={AgentsIcon}
                />
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
                `flex h-fit flex-row justify-between gap-4 rounded-lg bg-gray-100 px-3 md:py-2 drop-shadow-sm hover:bg-gray-200
                py-4`,
                className
            )}
        >
            <div className={'flex w-full md:flex-row flex-col items-start gap-8 '}>
                {globalLog && (
                    <div className={'flex items-center gap-3 sm:min-w-[200px]'}>
                        <AgentAvatar
                            activeStatus={false}
                            hash={history.agentId}
                            size={20}
                            isActive={false}
                            isLink
                        />
                        <div className="card-h2 flex basis-4/5 flex-col truncate">
                            <span className={'w-11/12 truncate text-sm leading-normal'}>
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
                <div className={'flex w-full flex-col items-start gap-2'}>
                    <div className={'flex flex-row items-center gap-1 hidde'}>
                        <span className={'text-sm font-medium'}>
                            {MapFunctionNameAndViewName[history.functionName] ||
                                history.functionName}
                        </span>
                        <span className={'rounded bg-blue-200 p-1 text-[8px]'}>
                            {history.triggerType || 'CRON'}
                        </span>
                    </div>
                    {history.parameters && (
                        <div className={'flex flex-col gap-0.5 '}>
                            <span className={'text-sm font-medium'}>Parameters</span>
                            {history.parameters?.map((param, index) => {
                                return (
                                    <LogFunctionParameter param={param} key={index} />
                                );
                            })}
                        </div>
                    )}
                    {history.result ? (
                        <div className={'flex flex-col gap-0.5'}>
                            <span className={'text-sm font-medium'}>Result</span>
                            {history.txHash || !history.message ? (
                                <LogObjectParameter
                                    longTruncate
                                    params={history.result}
                                />
                            ) : (
                                <span className={'text-xs'}>{history.message}</span>
                            )}
                        </div>
                    ) : history.txHash ? (
                        <TxHashComponent txHash={history.txHash} />
                    ) : (
                        <span className={'text-xs'}>{history.message}</span>
                    )}
                    {history.internal && <InternalLogs history={history} />}
                </div>
            </div>
            <div
                className={
                    ' flex min-w-fit flex-col items-end justify-start gap-1 md:min-w-[200px] absolute top-4 right-3 md:static'
                }
            >
                <Badge variant={getBadgeVariant()}>{getAgentExecutionStatus()}</Badge>
                <span className={'text-xs hidden md:flex'}>{formatTimestamp(history.timestamp)}</span>
            </div>
        </div>
    );
};

const InternalLogs = ({ history }: { history: IAgentTriggerHistory }) => {
    return (
        <div className={'md:flex w-full flex-col gap-1 hidden'}>
            {history.internal?.map((internal: any, index: number) => {
                return (
                    <div
                        key={index}
                        className={
                            'flex h-[45px] flex-row gap-1 border-0 border-t-2 border-brand-Black-200/30 p-0.5'
                        }
                    >
                        <div
                            className={`h-full w-1 ${internal.success ? 'bg-green-500' : 'bg-red-500'}`}
                        ></div>
                        <div className={'flex flex-col gap-0.5'}>
                            <span className={'text-sm font-medium'}>
                                {MapFunctionNameAndViewName[internal.function_name] ||
                                    internal.function_name}
                            </span>
                            {internal.txHash && (
                                <TxHashComponent txHash={internal.txHash} />
                            )}
                            {internal.message && (
                                <span className={'text-xs'}>{internal.message}</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const LogFunctionParameter = ({ param }: { param: any }) => {
    const { copyToClipboard } = useCopyClipboard();
    if (typeof param === 'string') {
        return <span className={'text-xs'}>{param}</span>;
    }
    const handleOnCopy = () => {
        copyToClipboard(param.value, `${formatParameterName(param.name)} Copied!`);
    };

    return (
        <div
            className={
                'flex w-[220px] flex-row gap-1 truncate text-xs drop-shadow sm:w-[300px] lg:w-[550px]'
            }
        >
            <span>{formatParameterName(param.name)} :</span>
            {typeof param.value === 'string' ? (
                <span
                    className={'w-full cursor-pointer truncate'}
                    onClick={handleOnCopy}
                >
                    {param.value}
                </span>
            ) : (
                <div className={'flex flex-col gap-1 '}>
                    <span className={'h-2'}></span>
                    <LogObjectParameter params={param.value} />
                </div>
            )}
        </div>
    );
};

const LogObjectParameter = ({
    params,
    longTruncate = false
}: {
    params: Record<any, any>;
    longTruncate?: boolean;
}) => {
    const { copyToClipboard } = useCopyClipboard();

    return Object.entries(params).map((param, index) => {
        return (
            <span
                onClick={() =>
                    copyToClipboard(
                        param[1],
                        `${formatParameterName(param[0])} copied!`
                    )
                }
                key={index}
                className={` cursor-pointer truncate text-xs drop-shadow ${longTruncate ? ' w-[250px] md:w-[550px]' : 'w-[100px] md:w-[400px]'}`}
            >
                {formatParameterName(param[0])} : {param[1]}
            </span>
        );
    });
};

const TxHashComponent = ({ txHash }: { txHash: string }) => {
    const { copyToClipboard } = useCopyClipboard();
    const handleOnClickCopy = () => {
        copyToClipboard(txHash, 'Transaction Hash Copied!');
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

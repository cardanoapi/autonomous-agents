'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Copy } from 'lucide-react';
import { OctagonAlert } from 'lucide-react';

import { IAgent } from '@app/app/api/agents';
import { IAgentTriggerHistory } from '@app/app/api/triggerHistory';
import { fetchAllTriggerHistory } from '@app/app/api/triggerHistory';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import parseTimestamp from '@app/utils/dateAndTimeUtils';

import AgentFunctionsDropDown from '../Common/AgentFunctionsDropDown';
import { Badge } from '../atoms/Badge';
import { cn } from '../lib/utils';
import { ScrollArea } from '../shadcn/ui/scroll-area';

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
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Agent Logs</span>
            </div>
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
            <ScrollArea className={'h-agentComponentHeight overflow-y-auto pr-4'}>
                <div className="grid grid-cols-1 gap-2">
                    {LogsHistory?.items.length > 0 ? (
                        LogsHistory.items.map(
                            (history: IAgentTriggerHistory, index: number) => (
                                <AgentLogCard
                                    history={history}
                                    key={index}
                                    className="bg-gray-100"
                                />
                            )
                        )
                    ) : loadingLogs === false ? (
                        <div className="flex gap-2 text-gray-500">
                            Trigger History Logs for{' '}
                            {statusPlaceholder === 'None' ? '' : `${statusPlaceholder}`}{' '}
                            {currentFunction === 'None' ? '' : `${currentFunction}`} are
                            empty <OctagonAlert />
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export const AgentLogCard = ({
    history,
    className
}: {
    history: IAgentTriggerHistory;
    className?: string;
}) => {
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
            <div className={'flex flex-col items-start gap-1'}>
                <div className={'flex flex-row items-center gap-1'}>
                    <span className={'text-sm font-medium'}>
                        {history.functionName}
                    </span>
                    <span className={'rounded bg-blue-200 p-1 text-[8px]'}>
                        {history.triggerType || 'CRON'}
                    </span>
                </div>
                <span className={'text-xs '}>{history.message || 'No message'}</span>
                {history.txHash && <TxHashComponent txHash={history.txHash} />}
            </div>
            <div
                className={
                    ' flex min-w-fit flex-col items-end justify-start gap-1 md:min-w-[200px]'
                }
            >
                <Badge variant={getBadgeVariant()}>{getAgentExecutionStatus()}</Badge>
                <span className={'text-xs'}>
                    {parseTimestamp(
                        history?.timestamp || '2024-06-18T07:07:00.283000+00:00'
                    )}
                </span>
            </div>
        </div>
    );
};

const TxHashComponent = ({ txHash }: { txHash: string }) => {
    return (
        <>
            <br />
            <div
                className={
                    'flex flex-row items-center gap-1 truncate text-sm font-medium '
                }
            >
                <h1>TxHash :</h1>
                <span
                    onClick={() => {
                        navigator.clipboard.writeText(txHash);
                        SuccessToast('Transaction Hash Copied!');
                    }}
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
                    onClick={() => {
                        navigator.clipboard.writeText(txHash);
                        SuccessToast('Transaction Hash Copied!');
                    }}
                />
            </div>
        </>
    );
};

export default AgentLogComponent;

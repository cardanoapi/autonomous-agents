'use client';

import { useQuery } from '@tanstack/react-query';
import { Copy } from 'lucide-react';

import { IAgent } from '@app/app/api/agents';
import {
    IAgentTriggerHistory,
    fetchAgentTriggerHistoryById
} from '@app/app/api/triggerHistory';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import parseTimestamp from '@app/utils/dateAndTimeUtils';

import { Badge } from '../atoms/Badge';
import { ScrollArea } from '../shadcn/ui/scroll-area';

const AgentLogComponent = ({ agent }: { agent?: IAgent }) => {
    const { data: agentHistory } = useQuery({
        queryKey: [`agentHistory${agent?.id}`],
        queryFn: () => fetchAgentTriggerHistoryById(agent?.id || '', 50),
        refetchInterval: 60000,
        refetchOnWindowFocus: true,
        refetchOnMount: true
    });
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Agent Logs</span>
            </div>
            <ScrollArea className={'h-agentComponentHeight overflow-y-auto pr-4'}>
                <div className={'grid grid-cols-1 gap-2'}>
                    {agentHistory?.items?.length ? (
                        agentHistory?.items?.map((history: IAgentTriggerHistory) => (
                            <AgentLogCard history={history} key={history.agentId} />
                        ))
                    ) : (
                        <span>No Agent Log Exists.</span>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export const AgentLogCard = ({ history }: { history: IAgentTriggerHistory }) => {
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
            className={`flex h-fit flex-row justify-between gap-4 rounded-lg bg-gray-100 px-3 py-2 drop-shadow-sm hover:bg-gray-200
                `}
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

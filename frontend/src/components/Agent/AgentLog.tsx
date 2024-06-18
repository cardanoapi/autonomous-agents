'use client';

import { useQuery } from '@tanstack/react-query';

import { IAgent } from '@app/app/api/agents';
import {
    IAgentTriggerHistory,
    fetchAgentTriggerHistoryById
} from '@app/app/api/triggerHistory';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import parseTimestamp from '@app/utils/dateAndTimeUtils';

import { Badge } from '../atoms/Badge';
import { ScrollArea } from '../shadcn/ui/scroll-area';

const AgentLogComponent = ({ agent }: { agent?: IAgent }) => {
    const { data: agentHistory } = useQuery({
        queryKey: [`agentHistory${agent?.id}`],
        queryFn: () => fetchAgentTriggerHistoryById(agent?.id || '', 50)
    });
    console.log('asd', agentHistory);
    return (
        <div className={'flex h-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Agent Logs</span>
            </div>
            <ScrollArea className={'h-agentComponentHeight overflow-y-auto pr-4'}>
                <div className={'flex flex-col gap-2'}>
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

const AgentLogCard = ({ history }: { history: IAgentTriggerHistory }) => {
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
            className={`flex h-fit w-full flex-row justify-between gap-4 rounded-lg bg-gray-100 px-3 py-2 drop-shadow-sm
                `}
        >
            <div className={'flex flex-col items-start gap-1'}>
                <span className={'text-sm font-medium'}>{history.functionName}</span>
                <span className={'text-xs '}>{history.message || 'No message'}</span>
            </div>
            <div
                className={
                    ' flex min-w-fit flex-col items-end justify-center gap-1 md:min-w-[160px]'
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

export default AgentLogComponent;

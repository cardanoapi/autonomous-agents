'use client';

import React from 'react';

import { IAgent } from '@api/agents';
import { hexToBech32 } from '@utils';

import TextDisplayField from '@app/components/molecules/TextDisplayField';

import { useModal } from '../Modals/context';
import { Button } from '../atoms/Button';
import { ScrollArea } from '../shadcn/ui/scroll-area';
import AgentHistoryComponent from './AgentHistory';
import CustomCopyBox from './CustomCopyBox';
import { IAgentTriggerHistory } from '@api/triggerHistory';
import { fetchAllTriggerHistory , fetchAgentTriggerHistoryById } from '@api/triggerHistory';
import { useQuery } from '@tanstack/react-query';

interface AgentOverViewProps {
    agent?: IAgent;
    enableEdit?: boolean;
}

const AgentOverViewComponent: React.FC<AgentOverViewProps> = ({ agent }) => {

    const {
        data: LogsHistory,
        refetch: refetchLogsHistory,
        isLoading: loadingLogs
    } = useQuery({
        queryKey: [
            `${agent?.id}LogsHistory`,
            1,
            24,
            agent?.id,
        ],
        queryFn: fetchAllTriggerHistory,
        refetchInterval: 60000,
        refetchOnWindowFocus: true,
        refetchOnMount: true
    });


    const { openModal } = useModal();

    const handleAgentRun = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        openModal('AgentRunnerView', {
            agentId: agent?.id
        });
    };

    const renderCustomCopyBox = (
        title: string,
        content: string | number,
        className: string = 'w-96 px-2 py-[6px]',
        showCopyIcon: boolean = true
    ) => (
        <CustomCopyBox
            title={title}
            content={content.toString()}
            className={className}
            showCopyIcon={showCopyIcon}
        />
    );
    
    return (
        <div className="flex h-full flex-col gap-10">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <TextDisplayField
                        title="Agent Name"
                        content={agent?.name}
                        textClassName="text-xl font-semibold"
                    />
                    {
                        !agent?.is_active && (     
                        <Button
                            variant="primary"
                            onClick={handleAgentRun}
                            size="sm"
                            className="min-w-32 px-4"
                        >
                            Run Agent
                        </Button>
                        )
                    }
                </div>
                <ScrollArea className="w-full overflow-y-auto h-[calc(100%-500px)]">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                {renderCustomCopyBox(
                                    'wallet address',
                                    agent?.agent_address || ''
                                )}
                                {renderCustomCopyBox(
                                    'wallet balance',
                                    `${Number(agent?.wallet_amount || 0).toFixed(2)} Ada`,
                                    '',
                                    false
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {renderCustomCopyBox('drep id', agent?.drep_id || '')}
                                {renderCustomCopyBox(
                                    'is drep registered',
                                    agent?.is_drep_registered ? 'Yes' : 'No',
                                    '',
                                    false
                                )}
                                {renderCustomCopyBox(
                                    'voting power',
                                    `${agent?.voting_power || 0} Ada`,
                                    '',
                                    false
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {renderCustomCopyBox(
                                    'stake id',
                                    hexToBech32(agent?.drep_id || '', 'stake_test')
                                )}
                                {renderCustomCopyBox(
                                    'is stake registered',
                                    agent?.is_stake_registered ? 'Yes' : 'No',
                                    '',
                                    false
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {renderCustomCopyBox(
                                    'delegated Drep',
                                    agent?.delegation?.drep_id || ''
                                )}
                                {renderCustomCopyBox(
                                    'delegated Pool',
                                    agent?.delegation?.pool_id || '',
                                    '',
                                    false
                                )}
                            </div>
                        </div>
                        <div>
                            <TriggerDataBox
                                triggerData={LogsHistory && LogsHistory.items || []}
                                lastActive={agent?.last_active}
                            />
                        </div>
                    </div>
                    <div className='mt-8'>
                    <AgentHistoryComponent chartClassName='w-full h-[550px]'/>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default AgentOverViewComponent;

const TriggerDataBox = ({
    triggerData,
    lastActive
}: {
    triggerData: IAgentTriggerHistory[];
    lastActive?: string;
}) => {
    const customBox = (status: string, width?: string, height?: string) => {
        const bgColor =
            status === 'success'
                ? 'bg-green-500'
                : status === 'failed'
                  ? 'bg-red-500'
                  : 'bg-gray-400';
        return (
            <div
                className={`${bgColor} ${width ? width : 'w-full'} ${height ? height : 'h-full'} rounded-lg hover:cursor-pointer`}
            ></div>
        );
    };

    return (
        <div className="flex w-full justify-between rounded-lg border-[1px] border-brand-border-100 px-10 py-6">
            <div className="flex flex-col gap-2 ">
                <div className="text-sm font-medium text-gray-600">Triggered</div>
                <div className="text-[10px] text-gray-500 ">Last 24 triggers</div>
                <div className="flex h-6 w-full gap-[6px]">
                    {triggerData.map((item, index) => customBox(item.status && item.success ? 'success' : item.status ? 'failed' : 'skipped', `w-3`, `h-full`))}
                </div>
            </div>
            <div className="flex w-full items-center justify-center">
                <div className="flex flex-col items-center gap-8">
                    <div className="items-center text-sm font-medium text-gray-600">
                        Last Active
                    </div>
                    <div className="items-center text-xs text-gray-500">
                        {lastActive ?  (new Date(lastActive).toDateString()) : 'Not Activated'}
                    </div>
                </div>
            </div>
        </div>
    );
};

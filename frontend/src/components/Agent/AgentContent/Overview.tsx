'use client';

import React from 'react';

import { IAgent } from '@api/agents';
import { IAgentTriggerHistory, fetchAllTriggerHistory } from '@api/triggerHistory';
import { useQuery } from '@tanstack/react-query';
import { hexToBech32 } from '@utils';

import { cn } from '@app/components/lib/utils';
import TextDisplayField from '@app/components/molecules/TextDisplayField';

import { useModal } from '../../Modals/context';
import { Button } from '../../atoms/Button';
import CustomCopyBox from '../shared/CustomCopyBox';
import AgentHistoryChart from '../shared/TriggerChart';
import HeaderContent from './ContentHeader';

interface AgentOverViewProps {
    agent?: IAgent;
    enableControl?: boolean;
}

const AgentOverViewComponent: React.FC<AgentOverViewProps> = ({ agent, enableControl }) => {
    const { data: LogsHistory } = useQuery({
        queryKey: [`${agent?.id}LogsHistory`, 1, 24, agent?.id],
        queryFn: fetchAllTriggerHistory,
        refetchInterval: 60000,
        refetchOnWindowFocus: true,
        refetchOnMount: true
    });

    const { openModal } = useModal();

    const handleAgentRun = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        openModal('AgentRunnerView', {
            agentSecretKey: agent?.secret_key
        });
    };

    const renderCustomCopyBox = (
        title: string,
        content: string | number,
        className: string = '',
        showCopyIcon: boolean = true
    ) => (
        <CustomCopyBox
            title={title}
            content={content.toString()}
            className={className + 'w-32 px-2 py-[6px] md:w-96'}
            showCopyIcon={showCopyIcon}
        />
    );

    return (
        <>
            <HeaderContent className="flex justify-between">
                <TextDisplayField title="Agent Name" content={agent?.name} textClassName="text-xl font-semibold" />
                {!agent?.is_active && enableControl && (
                    <Button variant="primary" onClick={handleAgentRun} size="sm" className="min-w-32 px-4">
                        Run Agent
                    </Button>
                )}
            </HeaderContent>
            <div
                className={
                    'flex h-full  w-full flex-col-reverse justify-end overflow-y-scroll md:flex-col md:justify-start'
                }
            >
                <div className="flex flex-col gap-8 max-md:mt-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            {renderCustomCopyBox(
                                'Successful Triggers',
                                agent?.no_of_successfull_triggers || 0,
                                '',
                                false
                            )}
                            {renderCustomCopyBox('Status', agent?.is_active ? 'Online' : 'Offline', '', false)}
                        </div>
                        <div className="flex items-center gap-3">
                            {renderCustomCopyBox('wallet address', agent?.agent_address || '')}
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
                                'w-fit',
                                false
                            )}
                            {renderCustomCopyBox('voting power', `${agent?.voting_power || 0} Ada`, 'w-fit', false)}
                        </div>
                        <div className="flex items-center gap-3">
                            {renderCustomCopyBox('stake id', hexToBech32(agent?.drep_id || '', 'stake_test'))}
                            {renderCustomCopyBox(
                                'is stake registered',
                                agent?.is_stake_registered ? 'Yes' : 'No',
                                '',
                                false
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {renderCustomCopyBox('delegated Drep', agent?.delegation?.drep_id || '')}
                            {renderCustomCopyBox('delegated Pool', agent?.delegation?.pool_id || '', '', false)}
                        </div>
                    </div>
                </div>
                <TriggerDataBox
                    triggerData={(LogsHistory && LogsHistory.items) || []}
                    lastActive={agent?.last_active}
                    className={'hidden md:flex'}
                />
                <div className="h-[250px] w-full md:h-[550px]">
                    <AgentHistoryChart chartClassName="w-full md:mt-8 " agent={agent} />
                </div>
            </div>
        </>
    );
};

export default AgentOverViewComponent;

const TriggerDataBox = ({
    triggerData,
    lastActive,
    numberOfBoxes = 24,
    className
}: {
    triggerData: IAgentTriggerHistory[];
    lastActive?: string;
    numberOfBoxes?: number;
    className?: string;
}) => {
    const dataSource = triggerData.map(
        (item) => (item.status && item.success ? 'success' : item.status ? 'failed' : 'skipped') as string
    );

    {
        console.log(dataSource.length, numberOfBoxes);
    }

    if (dataSource.length < numberOfBoxes) {
        const target = numberOfBoxes - dataSource.length;
        for (let i = 0; i < target; i++) {
            dataSource.push('skipped');
        }
    }

    const customBox = (status: string, width?: string, height?: string, index?: number) => {
        const bgColor = status === 'success' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-gray-400';
        return (
            <div
                className={`${bgColor} ${width ? width : 'w-full'} ${height ? height : 'h-full'} rounded-lg hover:cursor-pointer`}
                key={index}
            ></div>
        );
    };

    return (
        <div
            className={cn(
                'flex w-full justify-between rounded-lg border-[1px] border-brand-border-100 px-10 py-6',
                className
            )}
        >
            <div className="flex flex-col flex-wrap gap-2">
                <div className="text-sm font-medium text-gray-600">Triggered</div>
                <div className="text-[10px] text-gray-500 ">Last 24 triggers</div>
                <div className="flex h-6 w-full gap-[6px]">
                    {dataSource
                        .reverse()
                        .map((status: string, index: number) => customBox(status, `w-3`, `h-full`, index))}
                </div>
            </div>
            <div className="flex w-full items-center justify-center">
                <div className="flex flex-col items-center gap-8">
                    <div className="items-center text-sm font-medium text-gray-600">Last Active</div>
                    <div className="items-center text-xs text-gray-500">
                        {lastActive ? new Date(lastActive).toDateString() : 'Not Activated'}
                    </div>
                </div>
            </div>
        </div>
    );
};

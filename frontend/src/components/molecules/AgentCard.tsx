import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlayIcon, Trash2 } from 'lucide-react';

import { IAgent, deleteAgentbyID, fetchAgentbyID } from '@app/app/api/agents';
import { ITemplate, fetchTemplatebyID } from '@app/app/api/templates';
import {
    ITransactionsCount,
    fetchTransactionsCountByAgentID
} from '@app/app/api/trigger';
import AgentAvatar from '@app/components/Agent/AgentAvatar';
import { convertDictToGraphDataFormat } from '@app/components/Chart/ChartFilter';
import { cn } from '@app/components/lib/utils';
import { Truncate } from '@app/utils/common/extra';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import CustomLineChart from '../Chart/CustomLineChart';
import { useModal } from '../Modals/context';
import { Card, CardContent } from '../atoms/Card';
import { Dialog, DialogContent } from '../atoms/Dialog';
import ConfirmationBox from './ConfirmationBox';
import { ErrorToast, SuccessToast } from './CustomToasts';
import TransactionPieChart from './TransactionPieChart';

export interface IAgentCard {
    agentName: string;
    agentID?: string;
    templateID?: string;
    functionCount: number;
    lastActive: string | number;
    totalTrigger: number;
    enableEdit?: boolean;
    isActive?: boolean;
}

export default function AgentCard({
    agentName,
    agentID,
    templateID,
    functionCount,
    enableEdit = false,
    lastActive = '',
    isActive = false
}: IAgentCard) {
    const router = useRouter();

    const { openModal } = useModal();

    const { data: template } = useQuery<ITemplate>({
        queryKey: [`template${templateID}`],
        queryFn: () => fetchTemplatebyID(templateID || '')
    });

    const { data: currentagent } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID || '')
    });

    const { data: transactions_count } = useQuery<ITransactionsCount>({
        queryKey: [`Transactions${agentID}`],
        queryFn: () => fetchTransactionsCountByAgentID(agentID || '')
    });

    const [dialogOpen, setDialogOpen] = useState(false);

    const deleteAgentMutation = useMutation({
        mutationFn: (agentID: string) => deleteAgentbyID(agentID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            setDialogOpen(false);
            SuccessToast('Agent Deleted Successfully.');
        },
        onError: () => {
            setDialogOpen(false);
            ErrorToast('Agent Delete Failed. Try Again!');
        }
    });
    const [formatedLastActive, setFormatedLastActive] = useState<string | number>('');

    const { data: triggerHistoryMetric } = useQuery({
        queryKey: [`${agentID}TriggerHistoryMetric`],
        queryFn: () => fecthTriggerHistoryMetric([], agentID)
    });

    function getLastActiveMsg(lastActive: string | number): string {
        if (lastActive === 'NA') {
            return 'Not activated yet';
        } else {
            const lastActiveDate = new Date(lastActive);
            const currentDate = new Date();

            const diffInSeconds = Math.floor(
                (Number(currentDate) - Number(lastActiveDate)) / 1000
            );
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            if (diffInSeconds <= 60) {
                return `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} ago`;
            } else if (diffInDays >= 1) {
                return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
            } else if (diffInHours >= 1) {
                return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
            } else if (diffInMinutes >= 1) {
                return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
            } else return '';
        }
    }

    useEffect(() => {
        const lastActiveMsg = getLastActiveMsg(lastActive);
        lastActiveMsg && setFormatedLastActive(lastActiveMsg);
    }, [lastActive]);

    return (
        <>
            <Card
                onClick={() => {
                    router.push(`/agents/${agentID}`);
                }}
                className="hover-transition-primary group relative flex min-h-[250px] min-w-[260px] cursor-pointer flex-col justify-between !gap-y-4 rounded-xl p-6 transition-all"
            >
                <div>
                    <div
                        className={cn(
                            'absolute right-3 justify-end gap-1',
                            enableEdit ? 'flex' : 'hidden'
                        )}
                    >
                        <PlayIcon
                            color="#A1A1A1"
                            className="hidden hover:cursor-pointer group-hover:flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal('AgentRunnerView', {
                                    agentId: agentID
                                });
                            }}
                        />
                        <Trash2
                            color="#A1A1A1"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDialogOpen(true);
                            }}
                            className="hidden  hover:cursor-pointer group-hover:flex"
                        />
                    </div>
                    <div className={'flex items-center gap-3'}>
                        <AgentAvatar
                            hash={agentID || ''}
                            size={40}
                            isActive={isActive || false}
                        />
                        <div className="card-h2 flex flex-col">
                            <span className={'leading-normal'}>
                                {Truncate(agentName, 20)}
                            </span>
                            <span
                                className={
                                    'text-[10px] leading-normal text-brand-Black-300/80'
                                }
                            >
                                {Truncate(agentID || '', 25)}
                            </span>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col text-brand-Gray-200">
                        <CardContent className="flex flex-col gap-y-2">
                            {templateID && (
                                <span className="card-h4">
                                    Template:
                                    <span className="gray-background ml-1">
                                        {template?.name || 'Template Not Found'}
                                    </span>
                                </span>
                            )}
                            <span>
                                Total Functions :{' '}
                                <span className="text-active">{functionCount}</span>
                            </span>
                            <span>
                                No of Instance :
                                <span className="text-active">
                                    {' '}
                                    {currentagent?.instance}
                                </span>
                            </span>
                            <span>
                                Last Active :
                                <span className="text-active">
                                    {' '}
                                    {formatedLastActive}
                                </span>
                            </span>
                        </CardContent>
                    </div>
                </div>
                <div className="flex justify-between">
                    <div className="w-[40%]">
                        <TransactionPieChart
                            success={parseInt(
                                transactions_count?.successfulTransactions || '0'
                            )}
                            skipped={parseInt(
                                transactions_count?.skippedTransactions || '0'
                            )}
                            failed={parseInt(
                                transactions_count?.unSuccessfulTransactions || '0'
                            )}
                            className="!h-24 !w-24"
                        />
                    </div>
                    <div className="w-full">
                        <CustomLineChart
                            chartData={convertDictToGraphDataFormat(
                                triggerHistoryMetric?.last_week_successful_triggers ||
                                    [],
                                'Days'
                            )}
                            renderLines={false}
                            renderXaxis={false}
                            renderYaxis={false}
                            renderDot={false}
                            renderToolTip={true}
                            strokeColor={'#1C63E7'}
                            strokeWidth="4"
                            smoothStroke={true}
                            fillGradiant={true}
                            className="pl-6"
                            showOnlyTransaction={true}
                        />
                    </div>
                </div>
            </Card>
            <Dialog open={dialogOpen}>
                <DialogContent defaultCross={true} disableBG={false}>
                    <ConfirmationBox
                        title="Confirm Delete"
                        msg="Are you sure you want to delete this Agent? This process cannot be undone !"
                        onClose={() => {
                            setDialogOpen(false);
                        }}
                        onDecline={() => {
                            setDialogOpen(false);
                        }}
                        onAccept={() => {
                            deleteAgentMutation.mutateAsync(agentID || '');
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

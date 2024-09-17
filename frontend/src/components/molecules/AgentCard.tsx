import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDatetoHumanReadable } from '@utils';
import { PlayIcon, Trash2 } from 'lucide-react';

import { deleteAgentbyID } from '@app/app/api/agents';
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
import { Skeleton } from '../shadcn/ui/skeleton';
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
    enableDelete?: boolean;
    isActive?: boolean;
    showGraphFooter?: boolean;
}

export default function AgentCard({
    agentName,
    agentID,
    templateID,
    functionCount,
    enableEdit = false,
    enableDelete = false,
    lastActive = '',
    isActive = false,
    showGraphFooter = false
}: IAgentCard) {
    const router = useRouter();
    const { openModal } = useModal();
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: template } = useQuery<ITemplate>({
        queryKey: [`template-${templateID}`],
        queryFn: () => fetchTemplatebyID(templateID || '')
    });

    const { data: transactions_count } = useQuery<ITransactionsCount>({
        queryKey: [`Transactions-${agentID}`],
        queryFn: () => fetchTransactionsCountByAgentID(agentID || '')
    });

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

    const { data: triggerHistoryMetric } = useQuery({
        queryKey: [`${agentID}TriggerHistoryMetric`],
        queryFn: () => fecthTriggerHistoryMetric([], agentID)
    });

    /*const { data: currentAgent } = useQuery({
        queryKey: [`currentAgent/${agentID}`],
        queryFn: () => fetchAgentbyID(agentID || '')
    });*/

    function handleAgentRun(e: any) {
        e.stopPropagation();
        openModal('AgentRunnerView', {
            agentId: agentID
        });
    }

    function handleAgentDelete(e: any) {
        e.stopPropagation();
        setDialogOpen(true);
    }

    interface IAgentDetail {
        placeholder: string;
        value: string | number;
    }

    const agentDetails: IAgentDetail[] = [
        /*{
            placeholder: 'No of Instance',
            value: currentAgent?.instance || 0
        }, */
        {
            placeholder: 'Total Functions',
            value: functionCount
        },
        {
            placeholder: 'Last Active',
            value: formatDatetoHumanReadable(lastActive) || ''
        }
    ];

    const agentTriggerDetails: IAgentDetail[] = [
        {
            placeholder: 'Successfull Triggers',
            value: transactions_count?.successfulTransactions || 0
        }
        /*
        {
            placeholder: 'Unsuccessfull Triggers',
            value: transactions_count?.unSuccessfulTransactions || 0
        }*/
    ];

    function renderAgentDetails(agentDetails: IAgentDetail[]) {
        return (
            <div className="flex flex-col gap-y-2">
                {agentDetails.map(({ placeholder, value }, index) => (
                    <span key={index} className="!text-xs">
                        {placeholder} :{' '}
                        <span className="text-active text-xs">{value}</span>
                    </span>
                ))}
            </div>
        );
    }

    const templateStatus = templateID
        ? { text: template?.name || 'Template Missing' }
        : { text: 'Template not Used' };
    return (
        <>
            <Card
                onClick={() => {
                    router.push(`/agents/${agentID}`);
                }}
                className="hover-transition-primary group relative flex  min-h-[247px] min-w-[261px] cursor-pointer flex-col !gap-y-6 rounded-xl pl-5 pt-4 transition-all "
            >
                <AgentCardControls
                    enableRun={enableEdit}
                    enableDelete={enableDelete}
                    onRun={handleAgentRun}
                    onDelete={handleAgentDelete}
                />

                <AgentCardTitle
                    agentName={agentName}
                    agentID={agentID || ''}
                    isActive={isActive}
                />

                <CardContent className="flex flex-col gap-y-2">
                    <span className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-center">
                        Template:{' '}
                        <div className="gray-background ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                            {templateStatus.text}
                        </div>
                    </span>

                    {renderAgentDetails(agentDetails)}

                    {showGraphFooter ? (
                        <AgentGraphFooter
                            triggerHistoryMetric={triggerHistoryMetric}
                            transactions_count={transactions_count}
                        />
                    ) : (
                        <div className="pb-0">
                            {renderAgentDetails(agentTriggerDetails)}
                        </div>
                    )}
                </CardContent>
            </Card>
            <DeleteAgentDialog
                dialogOpen={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                }}
                onAccept={() => {
                    deleteAgentMutation.mutateAsync(agentID || '');
                }}
            />
        </>
    );
}

const AgentCardControls = ({
    enableRun,
    enableDelete,
    onRun,
    onDelete
}: {
    enableRun: boolean;
    enableDelete: boolean;
    onRun: any;
    onDelete: any;
}) => {
    return (
        <div
            className={cn(
                'absolute right-3 justify-end gap-1 bg-white',
                enableRun ? 'flex' : 'hidden'
            )}
        >
            <PlayIcon
                color="#A1A1A1"
                className="hidden hover:cursor-pointer group-hover:flex"
                onClick={onRun}
            />
            <Trash2
                color="#A1A1A1"
                onClick={onDelete}
                className={cn(
                    'hidden  hover:cursor-pointer group-hover:flex',
                    !enableDelete ? '!hidden' : ''
                )}
            />
        </div>
    );
};

const AgentCardTitle = ({
    agentID,
    agentName,
    isActive
}: {
    agentID: string;
    agentName: string;
    isActive?: boolean;
}) => {
    return (
        <div className={'flex items-center gap-3'}>
            <AgentAvatar hash={agentID || ''} size={40} isActive={isActive || false} />
            <div className="card-h2 flex flex-col">
                <span
                    className={
                        'w-36 !overflow-hidden text-ellipsis !whitespace-nowrap !text-sm leading-normal'
                    }
                >
                    {agentName}
                </span>
                <span
                    className={
                        'overflow-hidden !whitespace-nowrap text-[8px] leading-normal text-brand-Black-300/80'
                    }
                >
                    {Truncate(agentID || '', 25)}
                </span>
            </div>
        </div>
    );
};

const DeleteAgentDialog = ({
    dialogOpen,
    onAccept,
    onClose
}: {
    dialogOpen: boolean;
    onAccept: any;
    onClose: any;
}) => {
    return (
        <Dialog open={dialogOpen}>
            <DialogContent defaultCross={true} disableBG={false}>
                <ConfirmationBox
                    title="Confirm Delete"
                    msg="Are you sure you want to delete this Agent? This process cannot be undone !"
                    onClose={onClose}
                    onDecline={onClose}
                    onAccept={onAccept}
                />
            </DialogContent>
        </Dialog>
    );
};

const AgentGraphFooter = ({
    transactions_count,
    triggerHistoryMetric
}: {
    transactions_count?: ITransactionsCount;
    triggerHistoryMetric: any;
}) => {
    return (
        <div className="flex justify-between">
            <div className="w-[40%]">
                <TransactionPieChart
                    success={parseInt(
                        transactions_count?.successfulTransactions || '0'
                    )}
                    skipped={parseInt(transactions_count?.skippedTransactions || '0')}
                    failed={parseInt(
                        transactions_count?.unSuccessfulTransactions || '0'
                    )}
                    className="!h-24 !w-24"
                />
            </div>
            <div className="w-full">
                <CustomLineChart
                    chartData={convertDictToGraphDataFormat(
                        triggerHistoryMetric?.last_week_successful_triggers || [],
                        'Days'
                    ).toReversed()}
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
                    positionYToolTip={0}
                    positionXToolTip={0}
                />
            </div>
        </div>
    );
};

export const AgentCardSkeleton = ({ className }: { className?: string }) => {
    return (
        <Card
            className={cn(
                'mmin-w-[261px] flex min-h-[247px] flex-col justify-between gap-y-4 rounded-xl pl-5 pt-4',
                className
            )}
        >
            <div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex flex-col gap-[2px]">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-1 h-3 w-36" />
                    </div>
                </div>

                <div className="mt-6 flex flex-col text-brand-Gray-200">
                    <CardContent className="ml-2 flex flex-col gap-y-[10px]">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-28" />
                    </CardContent>
                </div>
            </div>
        </Card>
    );
};

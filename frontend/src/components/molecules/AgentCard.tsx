import { useState } from 'react';
import React from 'react';

import { useRouter } from 'next/navigation';

import { deleteAgentbyID } from '@api/agents';
import { useMutation } from '@tanstack/react-query';
import { formatDatetoHumanReadable } from '@utils';
import { PlayIcon, Trash2 } from 'lucide-react';

import AgentAvatar from '@app/components/Agent/shared/AgentAvatar';
import { cn } from '@app/components/lib/utils';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { useModal } from '../Modals/context';
import { Card, CardContent } from '../atoms/Card';
import { Dialog, DialogContent } from '../atoms/Dialog';
import { Skeleton } from '../shadcn/ui/skeleton';
import ConfirmationBox from './ConfirmationBox';
import { ErrorToast, SuccessToast } from './CustomToasts';

export interface IAgentCard {
    agentName: string;
    agentID?: string;
    templateName?: string;
    functionCount: number;
    lastActive: string | number;
    totalTrigger: number;
    enableEdit?: boolean;
    enableDelete?: boolean;
    no_of_successful_triggers?: number;
    isActive?: boolean;
    agentSecretKey?: string;
    className?: string;
}

export default function AgentCard({
    agentName,
    agentID,
    templateName,
    functionCount,
    no_of_successful_triggers,
    enableEdit = false,
    enableDelete = false,
    lastActive = '',
    isActive = false,
    agentSecretKey = '',
    className
}: IAgentCard) {
    const router = useRouter();
    const { openModal } = useModal();
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

    function handleAgentRun(e: any) {
        e.stopPropagation();
        openModal('AgentRunnerView', {
            agentSecretKey: agentSecretKey
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
            placeholder: 'Successful Triggers',
            value: no_of_successful_triggers || 0
        }
    ];

    function renderAgentDetails(agentDetails: IAgentDetail[]) {
        return (
            <div className="flex flex-col gap-y-2">
                {agentDetails.map(({ placeholder, value }, index) => (
                    <span key={index} className="!text-xs">
                        {placeholder} : <span className="text-active text-xs">{value}</span>
                    </span>
                ))}
            </div>
        );
    }

    return (
        <>
            <Card
                onClick={() => {
                    router.push(`/agents/${agentID}`);
                }}
                className={cn(
                    'hover-transition-primary group relative flex h-full w-full cursor-pointer flex-col !gap-y-6 rounded-xl p-4 transition-all sm:min-h-[247px] xl:max-w-[261px] ',
                    className
                )}
            >
                <AgentCardControls
                    enableRun={enableEdit}
                    enableDelete={enableDelete}
                    onRun={handleAgentRun}
                    onDelete={handleAgentDelete}
                />

                <AgentCardTitle agentName={agentName} agentID={agentID || ''} isActive={isActive} />

                <CardContent className="flex flex-col gap-y-2 ">
                    {templateName && (
                        <span className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-center">
                            Template:{' '}
                            <div className="gray-background ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                                {templateName}
                            </div>
                        </span>
                    )}

                    {renderAgentDetails(agentDetails)}

                    <div className="pb-0">{renderAgentDetails(agentTriggerDetails)}</div>
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
        <div className={cn('absolute right-3 justify-end gap-1 bg-white', enableRun ? 'flex' : 'hidden')}>
            <PlayIcon color="#A1A1A1" className="hidden hover:cursor-pointer group-hover:flex" onClick={onRun} />
            <Trash2
                color="#A1A1A1"
                onClick={onDelete}
                className={cn('hidden  hover:cursor-pointer group-hover:flex', !enableDelete ? '!hidden' : '')}
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
        <div className={'flex w-full items-center gap-3'}>
            <AgentAvatar hash={agentID || ''} size={40} isActive={isActive || false} />
            <div className="card-h2 flex w-full flex-col">
                <span
                    className={
                        'no-wrap-truncate w-full !overflow-hidden text-ellipsis !whitespace-nowrap !text-sm leading-normal'
                    }
                >
                    {agentName}
                </span>
            </div>
        </div>
    );
};

const DeleteAgentDialog = ({ dialogOpen, onAccept, onClose }: { dialogOpen: boolean; onAccept: any; onClose: any }) => {
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

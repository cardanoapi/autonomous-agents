import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, PlayIcon, Trash2 } from 'lucide-react';

import { IAgent, deleteAgentbyID, fetchAgentbyID } from '@app/app/api/agents';
import { ITemplate, fetchTemplatebyID } from '@app/app/api/templates';
import {
    ITransactionsCount,
    fetchTransactionsCountByAgentID
} from '@app/app/api/trigger';
import { Badge } from '@app/components/atoms/Badge';
import { Truncate } from '@app/utils/common/extra';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { useModal } from '../Modals/context';
import { Card, CardContent } from '../atoms/Card';
import { Dialog, DialogContent } from '../atoms/Dialog';
import { cn } from '../lib/utils';
import ConfirmationBox from './ConfirmationBox';
import { ErrorToast, SuccessToast } from './CustomToasts';

export interface IAgentCard {
    agentName: string;
    agentID?: string;
    templateID?: string;
    functionCount: number;
    lastActive: string | number;
    totalTrigger: number;
    enableEdit?: boolean;
    refetchData?: () => void;
}

export default function AgentCard({
    agentName,
    agentID,
    templateID,
    refetchData,
    functionCount,
    enableEdit = false,
    lastActive = ''
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

    const [isActiveWithinLast33Seconds, setIsActiveWithinLast33Seconds] =
        useState(false);
    const [formatedLastActive, setFormatedLastActive] = useState<string | number>('');

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
                if (diffInSeconds <= 33) {
                    setIsActiveWithinLast33Seconds(true);
                }
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
                className="hover-transition-primary group min-h-[260px] min-w-[260px] cursor-pointer rounded-xl p-6 transition-all"
            >
                <div className="flex items-center justify-between">
                    <div className="card-h2">{Truncate(agentName, 7)}</div>
                    <div className="flex gap-x-2">
                        <div className={cn(enableEdit ? 'flex' : 'hidden')}>
                            <PlayIcon
                                color="#A1A1A1"
                                className="hidden hover:cursor-pointer group-hover:flex"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal('AgentRunnerView', {
                                        agentId: agentID,
                                        refetchData: refetchData
                                    });
                                }}
                            />
                            <Trash2
                                color="#A1A1A1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDialogOpen(true);
                                }}
                                className="hidden hover:cursor-pointer group-hover:flex"
                            />
                        </div>
                        {isActiveWithinLast33Seconds ? (
                            <Badge variant={'success'}>Online</Badge>
                        ) : (
                            <Badge variant={'destructive'}>Offline</Badge>
                        )}
                    </div>
                </div>
                <div className="mt-5 flex flex-col gap-y-2 text-brand-Gray-200">
                    <CardContent className="flex flex-col gap-y-2">
                        <span className="card-h4">
                            Template :
                            <span className=" gray-background ml-1">
                                {template?.name || 'Nan'}
                            </span>
                        </span>
                        <span>
                            Total Functions :
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
                            <span className="text-active"> {formatedLastActive}</span>
                        </span>
                        <div className={'flex flex-row gap-2'}>
                            <FileText className={'h-5 w-5'} /> :
                            <span>{transactions_count?.totalTransactions} </span>
                        </div>
                    </CardContent>
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

import { useEffect, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Copy, Trash2 } from 'lucide-react';

import { IAgent, deleteAgentbyID, fetchAgentbyID } from '@app/app/api/agents';
import { ITemplate, fetchTemplatebyID } from '@app/app/api/templates';
import {
    ITrigger,
    fetchSuccessfullTriggersbyAgentID,
    fetchUnSuccessfullTriggersbyAgentID,
    fetchtriggersbyTemplateID
} from '@app/app/api/trigger';
import { Truncate } from '@app/utils/common/extra';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Card, CardContent, CardTitle } from '../atoms/Card';
import { Dialog, DialogContent } from '../atoms/Dialog';
import { Switch } from '../atoms/Switch';
import ConfirmationBox from './ConfirmationBox';
import { ErrorToast, SuccessToast } from './CustomToasts';

export interface IAgentCard {
    agentName: string;
    agentID: string;
    agentRole: string;
    templateID: string;
    functionCount: number;
    lastActive: string | number;
    totalTrigger: number;
}

export default function AgentCard({
    agentName,
    agentID,
    agentRole,
    templateID,
    lastActive = ''
}: IAgentCard) {
    const { data: template } = useQuery<ITemplate>({
        queryKey: [`template${templateID}`],
        queryFn: () => fetchTemplatebyID(templateID)
    });

    const { data: currentagent } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID)
    });

    const { data: templateTriggers = [] } = useQuery<ITrigger[]>({
        queryKey: [`triggers${templateID}`],
        queryFn: () => fetchtriggersbyTemplateID(templateID)
    });

    const { data: successfullTransactions = {} } = useQuery<{ string: string }[]>({
        queryKey: [`sucessfullTransactions${agentID}`],
        queryFn: () => fetchSuccessfullTriggersbyAgentID(agentID)
    });

    const { data: unsuccessfullTransactions = {} } = useQuery({
        queryKey: [`unsucessfullTransactions${agentID}`],
        queryFn: () => fetchUnSuccessfullTriggersbyAgentID(agentID)
    });

    const [dialogOpen, setDialogOpen] = useState(false);

    // interface DeleteAgentParams {
    //     agentID: string;
    //     onSuccess?: () => void;
    // }

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

    useEffect(() => {
        if (lastActive === 'NA') {
            setFormatedLastActive('Not activated yet');
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
                setFormatedLastActive(
                    `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} ago`
                );
                if (diffInSeconds <= 33) {
                    setIsActiveWithinLast33Seconds(true);
                }
            } else if (diffInDays >= 1) {
                setFormatedLastActive(
                    `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
                );
            } else if (diffInHours >= 1) {
                setFormatedLastActive(
                    `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
                );
            } else if (diffInMinutes >= 1) {
                setFormatedLastActive(
                    `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
                );
            }
        }
    }, [lastActive]);

    return (
        <>
            <Card className="hover-transition-primary group min-h-[260px] min-w-[260px] rounded-xl p-6 transition-all">
                <div className="flex items-center justify-between">
                    <div className="card-h2">{Truncate(agentName, 10)}</div>
                    <div className="flex gap-x-2">
                        <Copy
                            color="#A1A1A1"
                            className="hidden hover:cursor-pointer group-hover:flex"
                            onClick={() => {
                                navigator.clipboard.writeText(agentID);
                                SuccessToast('Agent ID Copied!');
                            }}
                        />
                        <Trash2
                            color="#A1A1A1"
                            onClick={() => {
                                setDialogOpen(true);
                            }}
                            className="hidden hover:cursor-pointer group-hover:flex"
                        />
                        <Switch checked={isActiveWithinLast33Seconds} />
                    </div>
                </div>
                <CardTitle className="!card-h3">{agentRole}</CardTitle>
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
                            <span className="text-active">
                                {' '}
                                {templateTriggers?.length}
                            </span>
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
                        <span>
                            Total Transactions :
                            <span>
                                {' '}
                                {Object.keys(successfullTransactions).length +
                                    Object.keys(unsuccessfullTransactions).length}
                            </span>
                        </span>
                    </CardContent>
                </div>
            </Card>
            <Dialog open={dialogOpen}>
                <DialogContent>
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
                            deleteAgentMutation.mutateAsync(agentID);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

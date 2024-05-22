import { useEffect } from 'react';
import { useState } from 'react';

import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

import { IAgent, deleteAgentbyID, fetchAgentbyID } from '@app/app/api/agents';
import { ITemplate, fetchTemplatebyID, fetchTemplates } from '@app/app/api/templates';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '../atoms/Dialog';
import { Switch } from '../atoms/Switch';
import ConfirmationBox from './ConfirmationBox';
import { ErrorToast, SuccessToast } from './CustomToasts';

export interface IAgentCard {
    agentName: string;
    agentID: string;
    agentRole: string;
    templateID: string;
    functionCount: number;
    lastActive: string;
    totalTrigger: number;
}

export default function AgentCard({
    agentName,
    agentID,
    agentRole,
    templateID,
    functionCount,
    lastActive = '',
    totalTrigger
}: IAgentCard) {
    const { data: template } = useQuery<ITemplate>({
        queryKey: [`template${templateID}`],
        queryFn: () => fetchTemplatebyID(templateID)
    });

    const { data: currentagent } = useQuery<IAgent>({
        queryKey: [`agent${agentID}`],
        queryFn: () => fetchAgentbyID(agentID)
    });

    const [dialogOpen, setDialogOpen] = useState(false);

    const deleteAgent = useMutation({
        mutationFn: (agentID: string) => deleteAgentbyID(agentID),
        onSuccess: () => {
            console.log('delete success agent')
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            setDialogOpen(false)
            SuccessToast('Agent Deleted Successfully.')
        },
        onError: () => {
            setDialogOpen(false)
            ErrorToast('Agent Delete Failed. Try Again!')
        }
    });

    const [isActiveWithinLast33Seconds, setIsActiveWithinLast33Seconds] =
        useState(false);
    const [formatedLastActive, setFormatedLastActive] = useState('');

    useEffect(() => {
        if (lastActive === 'NA') {
            setFormatedLastActive('Not activated yet');
        } else {
            const lastActiveDate = new Date(lastActive);
            const currentTime = Date.now();
            const timeDifference = currentTime - lastActiveDate.getTime();
            const timeDifferenceInSeconds = timeDifference / 1000;
            setIsActiveWithinLast33Seconds(timeDifferenceInSeconds <= 33);
            const day = lastActiveDate.getDate();
            const month = lastActiveDate.toLocaleString('default', { month: 'short' });
            const seconds = lastActiveDate.getSeconds();
            if (seconds === 1) {
                setFormatedLastActive(`${seconds} second ago`);
            } else {
                setFormatedLastActive(`${seconds} seconds ago`);
            }
        }
    }, [currentagent]);

    return (
        <>
            <Card className="hover-transition-primary max-h-[260px] min-h-[260px] min-w-[260px] max-w-[260px] rounded-xl p-6 transition-all">
                <div className="flex items-center justify-between">
                    <div className="card-h2">{agentName}</div>
                    <div className="flex gap-x-2">
                        <Trash2 color="#A1A1A1" onClick={()=>{setDialogOpen(true)}} className='hover:cursor-pointer'/>
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
                            Function :{' '}
                            <span className="text-active"> {functionCount}</span>
                        </span>
                        <span>
                            Last Active :
                            <span className="text-active"> {formatedLastActive}</span>
                        </span>
                        <span>
                            Total Triggers :
                            <span className="text-active"> {totalTrigger}</span>
                        </span>
                    </CardContent>
                </div>
            </Card>
            <Dialog open={dialogOpen}>
                <DialogContent >
                    <ConfirmationBox
                        title="Confirm Delete"
                        msg="Are you sure you want to delete this Agent? This process cannot be undone !"
                        onClose={()=>{setDialogOpen(false)}}
                        onDecline={()=>{setDialogOpen(false)}}
                        onAccept={()=>{deleteAgentbyID(agentID)}}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

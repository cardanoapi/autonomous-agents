import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import TemplateIcon from '../icons/TemplatesIcon';
import { Truncate } from '@app/utils/common/extra';
import { useMutation } from '@tanstack/react-query';
import { deleteTemplatebyID } from '@app/app/api/templates';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';
import { Dialog, DialogContent } from '../atoms/Dialog';
import { useState } from 'react';
import ConfirmationBox from './ConfirmationBox';
import { SuccessToast } from './CustomToasts';
import { useQuery } from '@tanstack/react-query';
import { fetchtriggersbyTemplateID } from '@app/app/api/trigger';
import { ITrigger } from '@app/app/api/trigger';

export interface ITemplateCard {
    templateName: string;
    templateID: string;
    templateDescription: string;
    templateTrigger: string;
}

export default function TemplateCard({
    templateName,
    templateID,
    templateDescription,
    templateTrigger,
}: ITemplateCard) {

    const [dialogOpen, setDialogOpen] = useState(false);

    const deleteTemplateMutation = useMutation({
        mutationFn: (templateID: string) => deleteTemplatebyID(templateID),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['templates'] });
            setDialogOpen(false)
            SuccessToast('Template Deleted Successfully')
        },
    });

    const {data : templateTriggers = []} = useQuery<ITrigger[]>({
        queryKey: [`triggers${templateID}`],
        queryFn: () => fetchtriggersbyTemplateID(templateID)
    })

    return (
        <>
            <Card className="hover-transition-primary flex min-h-[157px] min-w-[271px] flex-col justify-between gap-y-0 p-4 pb-6 pr-4 group">
                <div>
                    <div className='flex justify-between'>
                        <div className="flex items-center gap-x-2">
                            <TemplateIcon fill="#1C63E7" />
                            <CardTitle className="!h2">{Truncate(templateName, 17)}</CardTitle>
                        </div>
                            <Trash2 stroke='#A1A1A1' onClick={() => { setDialogOpen(true); }} className='hover:cursor-pointer hidden group-hover:flex'/>
                    </div>
                    <CardDescription className="card-description1 mt-2">
                        {Truncate(templateDescription, 60)}
                    </CardDescription>
                </div>
                <CardContent className="flex flex-col gap-y-2 gap">
                    <span className="card-h4">Total Triggers: {templateTrigger.length}</span>
                    <span className="card-h4 p-0">{templateID}</span>
                </CardContent>
            </Card>
            <Dialog open={dialogOpen}>
                <DialogContent>
                    <ConfirmationBox
                        title="Confirm Delete"
                        msg="Are you sure you want to delete this Template? This process cannot be undone!"
                        onClose={() => { setDialogOpen(false); }}
                        onDecline={() => { setDialogOpen(false); }}
                        onAccept={() => { deleteTemplateMutation.mutateAsync(templateID) }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
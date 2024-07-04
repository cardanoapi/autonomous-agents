import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { Edit, Trash2 } from 'lucide-react';

import { ITemplate, deleteTemplatebyID } from '@app/app/api/templates';
import { Truncate } from '@app/utils/common/extra';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import { Dialog, DialogContent } from '../atoms/Dialog';
import TemplateIcon from '../icons/TemplatesIcon';
import ConfirmationBox from './ConfirmationBox';
import { SuccessToast } from './CustomToasts';

export interface ITemplateCard {
    template: ITemplate;
    templateTrigger: string;
}

export default function TemplateCard({ template, templateTrigger }: ITemplateCard) {
    const router = useRouter();

    const [dialogOpen, setDialogOpen] = useState(false);

    const deleteTemplateMutation = useMutation({
        mutationFn: (templateID: string) => deleteTemplatebyID(templateID),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['templates'] });
            setDialogOpen(false);
            SuccessToast('Template Deleted Successfully');
        }
    });

    return (
        <>
            <Card className="hover-transition-primary group flex min-h-[157px] min-w-[271px] flex-col justify-between gap-y-0 p-4 pb-6 pr-4">
                <div>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-x-2">
                            <TemplateIcon fill="#1C63E7" />
                            <CardTitle className="!h2">
                                {Truncate(template.name, 17)}
                            </CardTitle>
                        </div>
                        <div className={'flex flex-row gap-1'}>
                            <Edit
                                color="#A1A1A1"
                                className={
                                    'hidden hover:cursor-pointer group-hover:flex'
                                }
                                onClick={() =>
                                    router.push(`/templates/${template.id}/edit`)
                                }
                            />
                            <Trash2
                                stroke="#A1A1A1"
                                onClick={() => {
                                    setDialogOpen(true);
                                }}
                                className="hidden hover:cursor-pointer group-hover:flex"
                            />
                        </div>
                    </div>
                    <CardDescription className="card-description1 mt-2">
                        {Truncate(template.description, 60)}
                    </CardDescription>
                </div>
                <CardContent className="gap flex flex-col gap-y-2">
                    <span className="card-h4">
                        Total Triggers: {templateTrigger.length}
                    </span>
                    <span className="card-h4 p-0">{template.id}</span>
                </CardContent>
            </Card>
            <Dialog open={dialogOpen}>
                <DialogContent>
                    <ConfirmationBox
                        title="Confirm Delete"
                        msg="Are you sure you want to delete this Template? This process cannot be undone!"
                        onClose={() => {
                            setDialogOpen(false);
                        }}
                        onDecline={() => {
                            setDialogOpen(false);
                        }}
                        onAccept={() => {
                            deleteTemplateMutation.mutateAsync(template.id);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

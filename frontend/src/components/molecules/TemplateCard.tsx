import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { Edit, Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';

import { ITemplate, deleteTemplatebyID } from '@app/app/api/templates';
import { Truncate } from '@app/utils/common/extra';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Card, CardContent, CardDescription, CardTitle } from '../atoms/Card';
import { Dialog, DialogContent } from '../atoms/Dialog';
import TemplateIcon from '../icons/TemplatesIcon';
import { cn } from '../lib/utils';
import ConfirmationBox from './ConfirmationBox';
import { SuccessToast } from './CustomToasts';

export interface ITemplateCard {
    template: ITemplate;
    enableEdit?: boolean;
}

export default function TemplateCard({ template, enableEdit = false }: ITemplateCard) {
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
                        <div className={cn('flex flex-row gap-1')}>
                            {enableEdit ? (
                                <>
                                    <Edit
                                        color="#A1A1A1"
                                        className={
                                            'hidden hover:cursor-pointer group-hover:flex'
                                        }
                                        onClick={() =>
                                            router.push(
                                                `/templates/${template.id}/edit`
                                            )
                                        }
                                    />
                                    <Trash2
                                        stroke="#A1A1A1"
                                        onClick={() => {
                                            setDialogOpen(true);
                                        }}
                                        className="hidden hover:cursor-pointer group-hover:flex"
                                    />
                                </>
                            ) : (
                                <>
                                    <Eye
                                        stroke="#A1A1A1"
                                        className="hidden hover:cursor-pointer group-hover:flex"
                                        onClick={() =>
                                            router.push(
                                                `/templates/${template.id}/edit`
                                            )
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    <CardDescription className="card-description1 mt-2">
                        {Truncate(template.description, 60)}
                    </CardDescription>
                </div>
                <CardContent className="gap flex flex-col gap-y-2">
                    <span className="card-h4">
                        Total Functions :{' '}
                        {template?.template_configurations?.length || 0}
                    </span>
                    <span className="card-h4 p-0">{template.id}</span>
                </CardContent>
            </Card>
            <Dialog open={dialogOpen}>
                <DialogContent disableBG={false} defaultCross={true}>
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

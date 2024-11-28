import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ITemplate, ITemplateConfiguration, deleteTemplatebyID } from '@api/templates';
import { useMutation } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

import { Truncate } from '@app/utils/common/extra';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { Card, CardContent, CardDescription } from '../atoms/Card';
import { Dialog, DialogContent } from '../atoms/Dialog';
import { Skeleton } from '../shadcn/ui/skeleton';
import ConfirmationBox from './ConfirmationBox';
import { SuccessToast } from './CustomToasts';

export interface ITemplateCard {
    template: ITemplate;
    enableDelete?: boolean;
}

export default function TemplateCard({
    template,
    enableDelete = false
}: ITemplateCard) {
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

    function returnTriggersList(triggers: ITemplateConfiguration[]) {
        const triggerNames = new Set();
        triggers.forEach((trigger) => {
            triggerNames.add(trigger.type);
        });
        return Array.from(triggerNames);
    }

    return (
        <div>
            <TemplateCardContent
                template={template}
                enableDelete={enableDelete}
                onEdit={() => router.push(`/templates/${template.id}`)}
                onDelete={() => setDialogOpen(true)}
                templateTriggerNames={returnTriggersList(
                    template.template_configurations || []
                )}
            />
            <DeleteTemplateDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={() => deleteTemplateMutation.mutateAsync(template.id)}
            />
        </div>
    );
}

function TemplateCardContent({
    template,
    enableDelete,
    onEdit,
    onDelete,
    templateTriggerNames
}: any) {
    const TriggersDiv = () => {
        return (
            <div className="card-h4 flex items-center gap-3">
                <div className="text-xs">Triggers</div>
                <div className="flex gap-1">
                    :
                    {templateTriggerNames.map((templateName: string) => (
                        <span
                            key={templateName}
                            className="rounded-md bg-gray-100 px-2 py-[1px] text-center text-[8px] tracking-widest"
                        >
                            {templateName}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Card
            className="hover-transition-primary group relative flex h-[137px] md:min-w-[280px] w-full flex-col justify-between gap-y-2 px-4 py-3 hover:cursor-pointer"
            onClick={onEdit}
        >
            <div>
                <TemplateCardHeader
                    templateName={template.name}
                    enableDelete={enableDelete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
                <CardDescription className="card-description1 mt-1 overflow-hidden text-xs">
                    {Truncate(template.description, 60)}
                </CardDescription>
                <CardContent className="mt-3 flex flex-col gap-y-0">
                    <span className="card-h4">
                        Functions : {template?.template_configurations?.length || 0}
                    </span>
                    <TriggersDiv />
                </CardContent>
            </div>
        </Card>
    );
}

function TemplateCardHeader({ templateName, enableDelete, onDelete }: any) {
    const iconClass =
        'absolute -top-1 h-5 w-5 -right-1 hidden hover:cursor-pointer group-hover:flex z-20 bg-white';

    return (
        <div className="relative z-10 flex justify-between gap-4">
            <div className="flex items-center gap-x-2 overflow-hidden">
                {/*<TemplateIcon fill="#1C63E7" />*/}
                <span className="inline-flex !overflow-hidden text-ellipsis whitespace-nowrap text-base font-normal">
                    {templateName}
                </span>
            </div>
            <div className="flex items-center gap-x-2 ">
                {enableDelete ? (
                    <div className="flex gap-2">
                        <Trash2
                            stroke="#A1A1A1"
                            className={iconClass}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent click from triggering the onEdit
                                onDelete(); // Call the delete handler
                            }}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function DeleteTemplateDialog({ isOpen, onClose, onConfirm }: any) {
    return (
        <Dialog open={isOpen}>
            <DialogContent disableBG={false} defaultCross={true}>
                <ConfirmationBox
                    title="Confirm Delete"
                    msg="Are you sure you want to delete this Template? This process cannot be undone!"
                    onClose={onClose}
                    onDecline={onClose}
                    onAccept={onConfirm}
                />
            </DialogContent>
        </Dialog>
    );
}

export const TemplateCardSkeleton = () => {
    return (
        <Card className="group flex min-h-[157px] min-w-[271px] flex-col justify-between gap-y-0 p-4 pb-6 pr-4">
            <div>
                <div className="flex justify-between">
                    <div className="flex items-center gap-x-2">
                        <Skeleton className="h-6 w-6  bg-gray-300" />
                        <div className="h-5 w-24 rounded-md bg-gray-300" />
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-y-1">
                    <Skeleton className="h-4 w-full rounded-md bg-gray-300" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <div className="mt-[1px] flex flex-col gap-y-2">
                        <Skeleton className="h-4 w-24 rounded-md bg-gray-300" />
                        <Skeleton className="h-4 w-20 rounded-md bg-gray-300" />
                    </div>
                </div>
            </div>
        </Card>
    );
};

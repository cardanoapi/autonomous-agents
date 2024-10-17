'use client';

import React, { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
    ITemplate,
    ITemplateConfiguration,
    fetchTemplatebyID,
    updateTemplateData
} from '@api/templates';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { Plus } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@app/components/atoms/Breadcrumb';
import { Button } from '@app/components/atoms/Button';
import { cn } from '@app/components/lib/utils';
import { ErrorToast, SuccessToast } from '@app/components/molecules/CustomToasts';
import TemplateConfigurations from '@app/components/molecules/TemplateConfigurations';
import UpdateTemplateFunctionModal from '@app/components/molecules/UpdateTemplateFunctionModal';
import { Dialog, DialogContent } from '@app/components/shadcn/dialog';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { templateAtom } from '@app/store/atoms/template';
import { adminAccessAtom } from '@app/store/localStore';

const EditTemplateCard = () => {
    const params = useParams();
    const router = useRouter();
    const templateId = params.templateId as string;

    const [adminAccess] = useAtom(adminAccessAtom);
    const [template, setTemplate] = useAtom(templateAtom);

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<ITemplate>({
        queryKey: [`template${templateId}`],
        queryFn: () => fetchTemplatebyID(templateId || '')
    });

    const updateTemplate = useMutation({
        mutationFn: (data: ITemplate) => updateTemplateData(data),
        onSuccess: () => {
            SuccessToast('Agent successfully updated.');
            queryClient.invalidateQueries({ queryKey: [`template${templateId}`] });
            router.push('/templates');
        },
        onError: (error: any) => {
            ErrorToast(error?.response?.data);
        }
    });

    useEffect(() => {
        if (data) {
            setTemplate(data);
        }
    }, [data]);

    const handleUpdateTemplateConfig = (
        updatedTemplateConfig: ITemplateConfiguration,
        updatedTemplateConfigIndex: number
    ) => {
        if (!template?.template_configurations) return;
        if (updatedTemplateConfigIndex < template.template_configurations.length) {
            template.template_configurations[updatedTemplateConfigIndex] =
                updatedTemplateConfig;
        } else {
            template.template_configurations.push(updatedTemplateConfig);
        }
        setTemplate({
            ...template
        });
    };

    const handleOnClickUpdate = () => {
        if (template) {
            updateTemplate.mutateAsync(template).then((res: any) => console.log(res));
        }
    };

    if (isLoading) {
        return <TemplateOverViewSkeleton />;
    }

    return (
        <div className={'flex max-w-[700px] flex-col gap-2'}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem
                        onClick={() => router.push('/templates')}
                        className="hover:cursor-pointer hover:text-brand-Blue-200"
                    >
                        Templates
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>{template?.name || 'Template Name'}</BreadcrumbItem>
                    <BreadcrumbSeparator />
                </BreadcrumbList>
            </Breadcrumb>
            <div className={' flex flex-col gap-2 rounded-lg bg-white px-4 py-3 '}>
                <div className={'flex justify-between'}>
                    <span className={'mb-2 text-lg font-medium'}>Overview</span>
                    <div className={' flex gap-2'}>
                        {isEditing && (
                            <Button
                                size={'sm'}
                                variant={'destructive'}
                                onClick={() => {
                                    setIsEditing(false);
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            size={'sm'}
                            variant={'primary'}
                            onClick={() => {
                                isEditing ? handleOnClickUpdate() : setIsEditing(true);
                            }}
                        >
                            {isEditing ? 'Update' : 'Edit'}
                        </Button>
                    </div>
                </div>
                {template && (
                    <TemplateOverview isEditing={isEditing} adminAccess={adminAccess} />
                )}
                <div className={'ga-1 flex flex-col gap-1'}>
                    <div className={'flex items-center gap-1'}>
                        <span className={'font-normal'}>Template Functions</span>
                        {isEditing && (
                            <div
                                className={cn(
                                    'cursor-pointer rounded p-0.5 hover:bg-gray-200',
                                    adminAccess ? '' : 'hidden'
                                )}
                                onClick={() => setOpenDialog(true)}
                            >
                                <Plus className={'h-5 w-5'} />
                            </div>
                        )}
                    </div>
                    <TemplateConfigurations isEditing={isEditing} />
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent
                        className={'!min-w-[650px] !p-0'}
                        onClickCloseIcon={() => setOpenDialog(false)}
                    >
                        <UpdateTemplateFunctionModal
                            header={'Add New Template Configurations'}
                            templateConfigIndex={
                                template?.template_configurations?.length || 0
                            }
                            templateConfigs={[]}
                            onClickSave={(
                                updatedTemplateConfig,
                                updatedTemplateConfigIndex
                            ) => {
                                handleUpdateTemplateConfig(
                                    updatedTemplateConfig,
                                    updatedTemplateConfigIndex
                                );
                                setOpenDialog(false);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

const TemplateOverview = ({
    isEditing,
    adminAccess
}: {
    isEditing: boolean;
    adminAccess: boolean;
}) => {
    const [template, setTemplate] = useAtom(templateAtom);
    if (!template) return <></>;
    const inputClassName =
        'rounded border text-sm text-brand-Black-300 disabled:opacity-80 border-brand-Black-300/20 px-2 py-1 hover:border-brand-Black-300/50 disabled:border-brand-Black-300/20';
    return (
        <div className={'flex flex-col gap-2'}>
            <div className={'flex flex-col '}>
                <span className={'font-normal text-brand-Black-300'}>Name</span>
                <input
                    value={template.name}
                    onChange={(e) =>
                        setTemplate({
                            ...template,
                            name: e.target.value
                        })
                    }
                    type="text"
                    className={inputClassName}
                    disabled={!adminAccess || !isEditing}
                />
            </div>
            <div className={'flex flex-col'}>
                <span className={'font-normal text-brand-Black-300'}>Description</span>
                <textarea
                    value={template.description}
                    onChange={(e) =>
                        setTemplate({
                            ...template,
                            description: e.target.value
                        })
                    }
                    disabled={!adminAccess || !isEditing}
                    rows={3}
                    className={`${inputClassName} resize-none`}
                />
            </div>
        </div>
    );
};

const TemplateOverViewSkeleton = () => {
    return (
        <div
            className={
                'flex max-w-[600px] flex-col gap-4 rounded-lg bg-white px-4 py-3'
            }
        >
            <Skeleton className="h-6 w-[140px]" />
            <div className={'flex flex-col gap-2'}>
                <Skeleton className="h-6 w-[140px]" />
                <Skeleton className="h-8 w-full" />
            </div>
            <div className={'flex flex-col gap-2'}>
                <Skeleton className="h-6 w-[140px]" />
                <Skeleton className="h-16 w-full" />
            </div>
            <div className={'flex flex-col gap-2'}>
                <Skeleton className="h-6 w-[140px]" />
                <div className={'flex flex-row flex-wrap gap-4'}>
                    <Skeleton className="h-20 w-[260px]" />
                    <Skeleton className="h-20 w-[260px]" />
                    <Skeleton className="h-20 w-[260px]" />
                    <Skeleton className="h-20 w-[260px]" />
                </div>
            </div>
        </div>
    );
};

export default EditTemplateCard;

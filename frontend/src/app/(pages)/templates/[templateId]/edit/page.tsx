'use client';

import React, { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
    ITemplate,
    ITemplateConfiguration,
    fetchTemplatebyID,
    updateTemplateData
} from '@api/templates';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { ChevronLeft, Plus } from 'lucide-react';

import { Button } from '@app/components/atoms/Button';
import { cn } from '@app/components/lib/utils';
import { ErrorToast, SuccessToast } from '@app/components/molecules/CustomToasts';
import TemplateConfigurations from '@app/components/molecules/TemplateConfigurations';
import UpdateTemplateFunctionModal from '@app/components/molecules/UpdateTemplateFunctionModal';
import { Dialog, DialogContent } from '@app/components/shadcn/dialog';
import { adminAccessAtom } from '@app/store/localStore';

const EditTemplateCard = () => {
    const params = useParams();
    const router = useRouter();
    const templateId = params.templateId as string;

    const { data: template } = useQuery<ITemplate>({
        queryKey: [`template${templateId}`],
        queryFn: () => fetchTemplatebyID(templateId)
    });

    const updateTemplate = useMutation({
        mutationFn: (data: ITemplate) => updateTemplateData(data),
        onSuccess: () => {
            SuccessToast('Agent successfully updated.');
            router.push('/templates');
        },
        onError: (error: any) => {
            ErrorToast(error?.response?.data);
        }
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [templateConfigurations, setTemplateConfigurations] = useState<
        Array<ITemplateConfiguration>
    >([]);
    const [adminAccess] = useAtom(adminAccessAtom);

    const [templateDetails, setTemplateDetails] = useState<{
        name: string;
        description: string;
    }>({ name: '', description: '' });

    useEffect(() => {
        if (template) {
            setTemplateDetails({
                name: template.name,
                description: template.description
            });
            template.template_configurations &&
                setTemplateConfigurations(template.template_configurations);
        }
    }, [template]);

    const handleUpdateTemplateConfig = (
        updatedTemplateConfig: ITemplateConfiguration,
        updatedTemplateConfigIndex: number
    ) => {
        if (updatedTemplateConfigIndex < templateConfigurations.length) {
            templateConfigurations[updatedTemplateConfigIndex] = updatedTemplateConfig;
        } else {
            templateConfigurations.push(updatedTemplateConfig);
        }
        setTemplateConfigurations([...templateConfigurations]);
    };

    const handleOnClickUpdate = () => {
        const reqData = {
            ...templateDetails,
            id: templateId,
            template_configurations: templateConfigurations
        };
        updateTemplate.mutateAsync(reqData).then((res: any) => console.log(res));
    };

    const onDeleteConfig = (configId: string) => {
        if (template) {
            const updatedConfigs = templateConfigurations?.filter(
                (config) => config.id != configId
            );
            updatedConfigs && setTemplateConfigurations(updatedConfigs);
        }
    };

    return (
        <div className={'flex flex-col gap-2'}>
            <div
                className={
                    'flex w-fit cursor-pointer gap-1 rounded px-2 py-1 hover:bg-gray-300'
                }
                onClick={() => router.push('/templates')}
            >
                <ChevronLeft />
                <span>Back</span>
            </div>
            <div className={'flex flex-col gap-4 rounded bg-white px-4 py-3'}>
                <span className={'font-medium'}>Template Details</span>
                <div className={'flex flex-row gap-6'}>
                    <div className={'flex flex-col gap-1'}>
                        <span className={'text-sm text-brand-Black-300'}>Name</span>
                        <input
                            value={templateDetails.name}
                            onChange={(e) =>
                                setTemplateDetails({
                                    ...templateDetails,
                                    name: e.target.value
                                })
                            }
                            type="text"
                            className={
                                'w-11/12 rounded border border-brand-Black-100/80 px-2 py-1'
                            }
                            disabled={!adminAccess}
                        />
                    </div>
                    <div className={'flex flex-col gap-1'}>
                        <span className={'text-sm text-brand-Black-300'}>
                            Description
                        </span>
                        <input
                            value={templateDetails.description}
                            onChange={(e) =>
                                setTemplateDetails({
                                    ...templateDetails,
                                    description: e.target.value
                                })
                            }
                            disabled={!adminAccess}
                            type="text"
                            className={
                                'w-11/12 rounded border border-brand-Black-100/80 px-2 py-1'
                            }
                        />
                    </div>
                </div>
                <div className={'flex items-center gap-4'}>
                    <span className={'font-medium'}>Template Functions</span>
                    <div
                        className={cn(
                            'cursor-pointer rounded p-1 hover:bg-gray-200',
                            adminAccess ? '' : 'hidden'
                        )}
                        onClick={() => setOpenDialog(true)}
                    >
                        <Plus />
                    </div>
                </div>
                <TemplateConfigurations
                    templateConfigurations={templateConfigurations}
                    onDeleteConfig={onDeleteConfig}
                    handleUpdateTemplateConfig={handleUpdateTemplateConfig}
                />
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent
                        className={'!min-w-[650px] !p-0'}
                        onClickCloseIcon={() => setOpenDialog(false)}
                    >
                        <UpdateTemplateFunctionModal
                            header={'Add New Template Configurations'}
                            templateConfigIndex={templateConfigurations.length}
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

                <div className={cn('flex justify-end', adminAccess ? '' : '!hidden')}>
                    <Button onClick={() => handleOnClickUpdate()}>Update</Button>
                </div>
            </div>
        </div>
    );
};

export default EditTemplateCard;

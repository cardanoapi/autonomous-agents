'use client';

import React, { useState } from 'react';

import { ICronTrigger } from '@api/agents';
import { ITemplateConfiguration } from '@api/templates';
import { useAtom } from 'jotai';
import { Edit, Trash2 } from 'lucide-react';

import UpdateTemplateFunctionModal from '@app/components/molecules/UpdateTemplateFunctionModal';
import { Dialog, DialogContent } from '@app/components/shadcn/ui/dialog';
import { templateAtom } from '@app/store/atoms/template';

import { cn } from '../shadcn/lib/utils';

const TemplateConfigurations = ({ isEditing }: { isEditing: boolean }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [templateConfigIndex, setTemplateConfigIndex] = useState(0);
    const [template, setTemplate] = useAtom(templateAtom);
    const onDeleteConfig = (configId: string) => {
        if (template && template.template_configurations) {
            const updatedConfigs = template.template_configurations?.filter(
                (config) => config.id != configId
            );
            updatedConfigs &&
                setTemplate({ ...template, template_configurations: updatedConfigs });
        }
    };
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

    return (
        <div className={'flex flex-row flex-wrap gap-3 pb-2'}>
            {template &&
            template.template_configurations &&
            template.template_configurations.length ? (
                template.template_configurations?.map((config, index) => {
                    return (
                        <div
                            className={
                                'group relative flex w-[300px] flex-col flex-wrap gap-2 rounded bg-brand-White-200 p-3 drop-shadow-md'
                            }
                            key={`${index}-${config?.id}`}
                        >
                            <span className={'text-sm text-gray-700'}>
                                Name : {config?.action?.function_name}
                            </span>
                            <span className={'text-sm text-gray-700'}>
                                Type : {config.type}
                            </span>
                            <span className={'text-sm text-gray-700'}>
                                Probability :{' '}
                                {(config.data as ICronTrigger).probability
                                    ? (config.data as ICronTrigger).probability
                                    : 1}
                            </span>

                            <div
                                className={cn(
                                    'absolute  right-2 top-2 gap-1',
                                    isEditing ? 'group-hover:flex' : 'hidden'
                                )}
                            >
                                <Edit
                                    color="#A1A1A1"
                                    className={
                                        ' hidden h-4 w-4 cursor-pointer group-hover:block'
                                    }
                                    onClick={() => {
                                        setOpenDialog(true);
                                        setTemplateConfigIndex(index);
                                    }}
                                />
                                <Trash2
                                    color="#A1A1A1"
                                    onClick={() => {
                                        onDeleteConfig(config.id);
                                    }}
                                    className="hidden h-4  w-4 hover:cursor-pointer  group-hover:block"
                                />
                            </div>
                        </div>
                    );
                })
            ) : (
                <span className={'text-xs text-brand-Black-300'}>
                    No Functions Found.
                </span>
            )}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent
                    className={'!min-w-[650px] !p-0'}
                    onClickCloseIcon={() => setOpenDialog(false)}
                >
                    <UpdateTemplateFunctionModal
                        header={'Update Template Configurations'}
                        templateConfigIndex={templateConfigIndex}
                        templateConfigs={template?.template_configurations}
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
    );
};

export default TemplateConfigurations;

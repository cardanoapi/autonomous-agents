'use client';

import React, { useState } from 'react';

import { ICronTrigger } from '@api/agents';
import { ITemplateConfiguration } from '@api/templates';
import { Edit, Trash2 } from 'lucide-react';

import UpdateTemplateFunctionModal from '@app/components/molecules/UpdateTemplateFunctionModal';
import { Dialog, DialogContent } from '@app/components/shadcn/dialog';

const TemplateConfigurations = ({
    templateConfigurations,
    onDeleteConfig,
    handleUpdateTemplateConfig
}: {
    templateConfigurations: Array<ITemplateConfiguration>;
    onDeleteConfig: (args: string) => void;
    handleUpdateTemplateConfig: (
        updatedTemplateConfig: ITemplateConfiguration,
        updatedTemplateConfigIndex: number
    ) => void;
}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [templateConfigIndex, setTemplateConfigIndex] = useState(0);
    console.log('sads : ', templateConfigurations);
    return (
        <div className={'flex flex-row flex-wrap gap-10'}>
            {templateConfigurations && templateConfigurations.length ? (
                templateConfigurations?.map((config, index) => {
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

                            <div className={'absolute right-2 top-2 flex gap-1'}>
                                {config.type === 'CRON' && (
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
                                )}
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
                        templateConfigs={templateConfigurations}
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

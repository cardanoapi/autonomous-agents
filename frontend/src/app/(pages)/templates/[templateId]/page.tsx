'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { ITemplate, ITemplateConfiguration, updateTemplateData } from '@api/templates';
import { fetchTemplatebyID } from '@api/templates';
import { Dialog, DialogContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { Plus } from 'lucide-react';
import { v4 } from 'uuid';

import FunctionCardWithMeta from '@app/components/Agent/shared/FunctionCardWithMeta';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@app/components/atoms/Breadcrumb';
import { Button } from '@app/components/atoms/Button';
import { Input } from '@app/components/atoms/Input';
import { Textarea } from '@app/components/atoms/Textarea';
import { Label } from '@app/components/atoms/label';
import ConfirmationBox from '@app/components/molecules/ConfirmationBox';
import { ErrorToast } from '@app/components/molecules/CustomToasts';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';
import { templateAtom } from '@app/store/atoms/template';
import { adminAccessAtom } from '@app/store/localStore';
import { Truncate } from '@app/utils/common/extra';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';

import { FunctionForm } from '../create-template/components/FunctionForm';
import {
    mapAgentConfigurationToFormFunction,
    mapFormFunctionToTemplateConfiguration,
    mapFormFunctionToTriggerConfiguration
} from '../create-template/components/utils/FunctionMapper';
import { IFormFunctionInstance } from '../create-template/page';

const EditTemplateCard = () => {
    const [adminAccess] = useAtom(adminAccessAtom);
    const [, setTemplate] = useAtom(templateAtom);

    const params = useParams();
    const templateId = params.templateId as string;

    const { data: template } = useQuery<ITemplate>({
        queryKey: [`template${templateId}`],
        queryFn: () => fetchTemplatebyID(templateId || '')
    });

    useEffect(() => {
        if (template) {
            setTemplate(template);
        }
    }, [template]);

    return (
        <div className="mt-12 flex h-full w-full flex-col gap-6">
            <TemplateBreadCrumb templateName={template?.name} />
            <div className="relative h-full max-w-agentComponentWidth flex-1 rounded-lg bg-white p-8">
                {template && <TemplateMetaData template={template} />}
            </div>
        </div>
    );
};

const TemplateBreadCrumb = ({ templateName }: { templateName?: string }) => {
    const router = useRouter();
    return (
        <div className="flex h-full flex-col gap-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem
                        onClick={() => router.push('/templates')}
                        className="hover:cursor-pointer hover:text-brand-Blue-200"
                    >
                        Templates
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        {Truncate(templateName || '', 30) || 'Template Name'}
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};
const TemplateMetaData = ({ template }: { template: ITemplate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addFunctionDialogOpen, setAddFunctionDialogOpen] = useState(false);
    const [deleteFunctionDialogOpen, setDeleteFunctionDialogOpen] = useState(false);
    const [templateDataCopy, setTemplateDataCopy] = useState<ITemplate>(template);

    const [deleteIndex, setDeleteIndex] = useState(0);

    const templateUpdateMutation = useMutation({
        mutationFn: (template: ITemplate) => updateTemplateData(template),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [`template${template.id}`] });
            setDialogOpen(false);
            SuccessToast('Template Updated Successfully');
        },
        onError: () => {
            ErrorToast('Template Update Failed. Please try again.');
        }
    });

    const [currentFunction, setCurrentFunctionItem] =
        useState<IFormFunctionInstance | null>(null);

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleDataChange = (key: string, value: string) => {
        setTemplateDataCopy((prevState) => ({ ...prevState, [key]: value }));
    };

    const toggleDialog = () => {
        setDialogOpen(!dialogOpen);
    };

    const toggleAddFunctionDialog = () => {
        setAddFunctionDialogOpen(!addFunctionDialogOpen);
    };

    const toggleDeleteFunctionDialog = () => {
        setDeleteFunctionDialogOpen(!deleteFunctionDialogOpen);
    };

    const handleFunctionEdit = (functionItem: any) => {
        const convertedFunction = mapAgentConfigurationToFormFunction(functionItem);
        setCurrentFunctionItem(convertedFunction);
        toggleDialog();
    };

    const handleFunctionUpdate = (functionItem: IFormFunctionInstance) => {
        const convertedFunction = mapFormFunctionToTemplateConfiguration(
            functionItem,
            template.id
        );

        if (templateDataCopy.template_configurations) {
            const newConfigurations: ITemplateConfiguration[] =
                templateDataCopy.template_configurations.map((config) =>
                    config.id === functionItem.id ? convertedFunction : config
                );

            setTemplateDataCopy({
                ...templateDataCopy,
                template_configurations: newConfigurations
            });
            toggleDialog();
        }
    };

    const handleFunctionDelete = (index: number) => {
        if (templateDataCopy.template_configurations) {
            const newConfigurations: ITemplateConfiguration[] =
                templateDataCopy.template_configurations.filter(
                    (config, i) => i !== index
                );
            setTemplateDataCopy({
                ...templateDataCopy,
                template_configurations: newConfigurations
            });
        }
        toggleDeleteFunctionDialog();
    };

    const validateData = () => {
        if (!templateDataCopy.name || templateDataCopy.name.length === 0) {
            ErrorToast('Template Name is required');
        } else if (
            !templateDataCopy.template_configurations ||
            templateDataCopy.template_configurations.length === 0
        ) {
            ErrorToast('At least one function is required');
        } else if (
            !templateDataCopy.description ||
            templateDataCopy.description.length === 0
        ) {
            ErrorToast('Template description is required');
        } else {
            return true;
        }
        return false;
    };

    const handleAddNewFunction = (functionItem: IFormFunctionInstance) => {
        const convertedConfiguration = {
            ...mapFormFunctionToTemplateConfiguration(functionItem, template.id),
            id: v4()
        };
        setTemplateDataCopy({
            ...templateDataCopy,
            template_configurations: [
                ...(templateDataCopy.template_configurations || []),
                convertedConfiguration
            ]
        });
        toggleAddFunctionDialog();
    };

    const handleSaveTemplate = () => {
        if (validateData()) {
            console.log(templateDataCopy);
            setIsEditing(false);
            templateUpdateMutation.mutate(templateDataCopy);
        }
    };

    const handleCancelSave = () => {
        setIsEditing(false);
        setTemplateDataCopy(template);
    };

    return (
        <div className="flex h-full w-full flex-col gap-4 ">
            <div className="flex w-[60%] flex-col gap-4 2xl:w-[40%]">
                <div className="flex flex-col gap-2">
                    <Label>Template Name</Label>
                    <Input
                        value={templateDataCopy?.name || ''}
                        className="mx-[2px]"
                        viewOnly={!isEditing}
                        onChange={(e: any) => {
                            handleDataChange('name', e.target.value);
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Template Description</Label>
                    <Textarea
                        value={templateDataCopy.description || ''}
                        className="mx-[2px]"
                        viewOnly={!isEditing}
                        onChange={(e: any) => {
                            handleDataChange('description', e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col">
                <div className="relative flex w-fit items-center gap-2 p-2 pr-8">
                    <Label>Template Functions</Label>
                    {isEditing && (
                        <Plus
                            className="absolute right-0 cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={toggleAddFunctionDialog}
                        />
                    )}
                </div>
                <ScrollArea className="h-[320px] w-full overflow-y-auto px-2 py-2 2xl:h-[400px]">
                    <div className="flex flex-row flex-wrap gap-6">
                        {templateDataCopy.template_configurations?.map(
                            (config, index) => (
                                <FunctionCardWithMeta
                                    key={index}
                                    config={config}
                                    enableContol={isEditing}
                                    handleClickEdit={handleFunctionEdit}
                                    onClickDelete={() => {
                                        setDeleteIndex(index);
                                        toggleDeleteFunctionDialog();
                                    }}
                                />
                            )
                        )}
                    </div>
                </ScrollArea>
            </div>
            <div className="flex justify-end">
                <EditBtns
                    isEditing={isEditing}
                    onSave={handleSaveTemplate}
                    onEdit={toggleEdit}
                    onCancel={handleCancelSave}
                />
            </div>
            <Dialog open={dialogOpen}>
                <DialogContent className="!p-0">
                    {currentFunction && (
                        <FunctionForm
                            currentFunction={currentFunction}
                            onValueChange={() => {}}
                            onClose={toggleDialog}
                            onSave={handleFunctionUpdate}
                            btnPlaceholder="Update"
                        />
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={addFunctionDialogOpen}>
                <DialogContent className="!p-0">
                    <FunctionForm
                        renderFunctionSelector={true}
                        onValueChange={() => {}}
                        onClose={toggleAddFunctionDialog}
                        onSave={handleAddNewFunction}
                        btnPlaceholder="Add"
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={deleteFunctionDialogOpen}>
                <DialogContent>
                    <ConfirmationBox
                        onAccept={() => handleFunctionDelete(deleteIndex)}
                        onClose={toggleDeleteFunctionDialog}
                        onDecline={toggleDeleteFunctionDialog}
                        title="Delete Template"
                        msg="Are you sure you want to delete this Function? This function will be lost once template is saved."
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

const EditBtns = ({
    isEditing,
    onSave,
    onEdit,
    onCancel
}: {
    isEditing: boolean;
    onSave?: () => void;
    onEdit?: () => void;
    onCancel?: () => void;
}) => {
    return (
        <div className="flex flex-row gap-4">
            {isEditing ? (
                <>
                    <Button className="w-[100px]" onClick={onCancel} size={'md'}>
                        Cancel
                    </Button>
                    <Button
                        className="w-[100px]"
                        onClick={onSave}
                        size={'md'}
                        variant={'primary'}
                    >
                        Save
                    </Button>
                </>
            ) : (
                <Button
                    className="w-[100px]"
                    onClick={onEdit}
                    size={'md'}
                    variant={'primary'}
                >
                    Edit
                </Button>
            )}
        </div>
    );
};

export default EditTemplateCard;

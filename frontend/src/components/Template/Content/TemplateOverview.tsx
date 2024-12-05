import { useState } from 'react';

import { ITemplate } from '@api/templates';
import { ITemplateConfiguration } from '@api/templates';
import { updateTemplateData } from '@api/templates';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { v4 } from 'uuid';

import {
    mapAgentConfigurationToFormFunction,
    mapFormFunctionToTemplateConfiguration
} from '@app/app/(pages)/templates/create-template/components/utils/FunctionMapper';
import { IFormFunctionInstance } from '@app/app/(pages)/templates/create-template/page';
import FunctionCardWithMeta from '@app/components/Agent/shared/FunctionCardWithMeta';
import { Input } from '@app/components/atoms/Input';
import { Textarea } from '@app/components/atoms/Textarea';
import { Label } from '@app/components/atoms/label';
import { ErrorToast } from '@app/components/molecules/CustomToasts';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { queryClient } from '@app/utils/providers/ReactQueryProvider';
import { useMediaQuery } from '@mui/material';

import {
    AddFunctionDialog,
    DeleteFunctionDialog,
    UpdateFunctionDialog
} from './Dialogs';
import EditBtns from './EditBtns';

const TemplateOverview = ({
    template,
    enableEdit
}: {
    template: ITemplate;
    enableEdit?: boolean;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addFunctionDialogOpen, setAddFunctionDialogOpen] = useState(false);
    const [deleteFunctionDialogOpen, setDeleteFunctionDialogOpen] = useState(false);
    const [templateDataCopy, setTemplateDataCopy] = useState<ITemplate>(template);
    const isMobile = useMediaQuery('(max-width: 600px)');

    const [deleteIndex, setDeleteIndex] = useState(0);

    const templateUpdateMutation = useMutation({
        mutationFn: (template: ITemplate) => updateTemplateData(template),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [`template${template.id}`] });
            setDialogOpen(false);
            SuccessToast('Template Updated Successfully');
            setIsEditing(false);
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
            templateUpdateMutation.mutate(templateDataCopy);
        }
    };

    const handleCancelSave = () => {
        setIsEditing(false);
        setTemplateDataCopy(template);
    };

    return (
        <div className="flex h-full w-full flex-col gap-4 relative">
            <div className="flex w-full flex-col gap-4 md:w-[60%] 2xl:w-[40%]">
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
            <div className="flex flex-col h-full w-full">
                <div className="relative flex w-fit items-center gap-2 p-2 pr-8 bg-">
                    <Label>Template Functions</Label>
                    {isEditing && (
                        <Plus
                            className="absolute right-0 cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={toggleAddFunctionDialog}
                        />
                    )}
                </div>
                <div className="flex flex-row flex-wrap gap-4">
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
            </div>
            {enableEdit && (
                <div className="">
                    <EditBtns
                        isEditing={isEditing}
                        onSave={handleSaveTemplate}
                        onEdit={toggleEdit}
                        onCancel={handleCancelSave}
                    />
                </div>
            )}
            <UpdateFunctionDialog
                dialogOpen={dialogOpen}
                toggleDialog={toggleDialog}
                currentFunction={currentFunction}
                handleFunctionUpdate={handleFunctionUpdate}
                fullScreen={isMobile}
            />
            <AddFunctionDialog
                dialogOpen={addFunctionDialogOpen}
                toggleDialog={toggleAddFunctionDialog}
                handleAddNewFunction={handleAddNewFunction}
                fullScreen={isMobile}
            />
            <DeleteFunctionDialog
                dialogOpen={deleteFunctionDialogOpen}
                toggleDialog={toggleDeleteFunctionDialog}
                deleteIndex={deleteIndex}
                handleFunctionDelete={handleFunctionDelete}
                fullScreen={isMobile}
            />
        </div>
    );
};

export default TemplateOverview;

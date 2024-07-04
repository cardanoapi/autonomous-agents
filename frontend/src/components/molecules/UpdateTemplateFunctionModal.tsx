'use client';

import React, { useEffect, useState } from 'react';

import { ICronTrigger } from '@api/agents';
import { ITemplateConfiguration } from '@api/templates';
import { AGENT_TRIGGER, AgentFunctions } from '@consts';
import { AgentTriggerFunctionType } from '@models/types';

import { Button } from '@app/components/atoms/Button';
import { Combobox } from '@app/components/molecules/Combobox';
import ProbabilityInput from '@app/components/molecules/ProbabilityInput';
import { Separator } from '@app/components/shadcn/ui/separator';

const UpdateTemplateFunctionModal = ({
    templateConfigIndex,
    templateConfigs,
    onClickSave
}: {
    templateConfigIndex: number;
    templateConfigs?: Array<ITemplateConfiguration>;
    onClickSave?: (agentConfig: ITemplateConfiguration, index: number) => void;
}) => {
    const filteredAgentFunctions = AgentFunctions.map((item) => item.function_name);
    const templateConfig = templateConfigs![templateConfigIndex];
    const defaultProbabilityStringValue = (
        (templateConfig.data as ICronTrigger).probability * 100
    ).toString();

    const [localTemplateConfigurations, setLocalTemplateConfigurations] = useState<{
        function_name: string;
        parameter: Array<{ name: string; value: string }>;
    }>({
        function_name: '',
        parameter: []
    });

    useEffect(() => {
        templateConfig &&
            templateConfig.action &&
            setLocalTemplateConfigurations(templateConfig.action);
    }, [templateConfig]);

    const [probability, setProbability] = useState<string>(
        defaultProbabilityStringValue
    );

    const handleInputParamsChange = (value: string, index: number) => {
        localTemplateConfigurations.parameter[index].value = value;
        setLocalTemplateConfigurations({ ...localTemplateConfigurations });
    };

    const handleClickSave = () => {
        const filteredParams = localTemplateConfigurations.parameter.map((param) => ({
            name: param.name,
            value: param.value
        }));
        onClickSave &&
            onClickSave(
                {
                    ...templateConfig,
                    action: {
                        ...templateConfig.action,
                        function_name: localTemplateConfigurations.function_name,
                        parameter: filteredParams
                    },
                    data: {
                        ...(templateConfig.data as ICronTrigger),
                        probability: probability ? +probability / 100 : 0
                    }
                },
                templateConfigIndex
            );
    };

    return (
        <div className={'bg-white'}>
            <div className={'px-5 py-2'}>Update Template Configurations</div>
            <Separator />
            <div className={'flex flex-col gap-4 p-5'}>
                <div className={'flex flex-col gap-1'}>
                    <span className={'font-medium'}>Function Name</span>
                    <Combobox
                        defaultValue={templateConfig.action?.function_name}
                        itemsList={filteredAgentFunctions}
                        onSelect={(function_name: string) => {
                            const parameter =
                                AGENT_TRIGGER[function_name as AgentTriggerFunctionType]
                                    ?.parameter;
                            const filteredParams = parameter?.map((param) => ({
                                name: param.name,
                                value: ''
                            }));
                            setLocalTemplateConfigurations({
                                function_name,
                                parameter: filteredParams
                            });
                        }}
                    />
                </div>
                <div className={'flex flex-col gap-1'}>
                    <span className={'font-medium'}>Parameters</span>
                    <div className={'grid grid-cols-2 gap-2'}>
                        {localTemplateConfigurations?.parameter?.map((param, index) => {
                            return (
                                <div className={'flex flex-col gap-2'} key={param.name}>
                                    <span className={'text-sm text-brand-Black-300'}>
                                        {param.name}
                                    </span>
                                    <input
                                        value={param.value}
                                        onChange={(e) =>
                                            handleInputParamsChange(
                                                e.target.value,
                                                index
                                            )
                                        }
                                        type="text"
                                        className={
                                            'w-11/12 rounded border border-brand-Black-100/80 px-2 py-1'
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={'flex flex-col gap-1'}>
                    <span className={'font-medium'}>Probability</span>
                    <ProbabilityInput
                        onInputChange={(probability: string) =>
                            setProbability(probability)
                        }
                        defaultValue={defaultProbabilityStringValue}
                    />
                </div>
                <Button
                    onClick={handleClickSave}
                    className={'relative right-0 w-1/4'}
                    variant={'primary'}
                >
                    Save
                </Button>
            </div>
        </div>
    );
};

export default UpdateTemplateFunctionModal;

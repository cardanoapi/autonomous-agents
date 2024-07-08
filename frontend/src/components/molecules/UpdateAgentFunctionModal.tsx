'use client';

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import { IAgentConfiguration, ICronTrigger } from '@api/agents';
import { AGENT_TRIGGER, AgentFunctions } from '@consts';
import { AgentTriggerFunctionType } from '@models/types';

import { Button } from '@app/components/atoms/Button';
import { CustomCombobox } from '@app/components/molecules/CustomCombobox';
import ProbabilityInput from '@app/components/molecules/ProbabilityInput';
import { Separator } from '@app/components/shadcn/ui/separator';

const UpdateAgentFunctionModal = ({
    header,
    agentConfigIndex,
    agentConfigs,
    onClickSave
}: {
    header: string;
    agentConfigIndex: number;
    agentConfigs?: Array<IAgentConfiguration>;
    onClickSave?: (agentConfig: IAgentConfiguration, index: number) => void;
}) => {
    const params = useParams();
    const agentId = params.agentID as string;

    const filteredAgentFunctions = AgentFunctions.map((item) => item.function_name);
    const agentConfig = agentConfigs![agentConfigIndex];
    const defaultProbabilityStringValue = (
        ((agentConfig?.data as ICronTrigger)?.probability || 1) * 100
    ).toString();

    const [localAgentActionConfigurations, setLocalAgentActionConfigurations] =
        useState<{
            function_name: string;
            parameter: Array<{ name: string; description?: string; value: string }>;
        }>({
            function_name: '',
            parameter: []
        });

    useEffect(() => {
        agentConfig &&
            agentConfig.action &&
            setLocalAgentActionConfigurations(agentConfig.action);
    }, [agentConfig]);

    const [probability, setProbability] = useState<string>(
        defaultProbabilityStringValue
    );

    const handleInputParamsChange = (value: string, index: number) => {
        localAgentActionConfigurations.parameter[index].value = value;
        setLocalAgentActionConfigurations({ ...localAgentActionConfigurations });
    };

    const handleClickSave = () => {
        const filteredParams = localAgentActionConfigurations.parameter.map(
            (param) => ({
                name: param.name,
                value: param.value
            })
        );
        onClickSave &&
            onClickSave(
                {
                    ...agentConfig,
                    action: {
                        ...agentConfig?.action,
                        function_name: localAgentActionConfigurations.function_name,
                        parameter: filteredParams
                    },
                    data: {
                        ...(agentConfig?.data as ICronTrigger),
                        probability: probability ? +probability / 100 : 0,
                        frequency: agentConfig
                            ? (agentConfig.data as ICronTrigger).frequency
                            : '* * * * *'
                    },
                    type: agentConfig ? agentConfig.type : 'CRON',
                    agent_id: agentConfig ? agentConfig.agent_id : agentId,
                    id: agentConfig ? agentConfig.id : ''
                },
                agentConfigIndex
            );
    };

    return (
        <div className={'bg-white'}>
            <div className={'px-5 py-2'}>{header}</div>
            <Separator />
            <div className={'flex flex-col gap-4 p-5'}>
                <div className={'flex flex-col gap-1'}>
                    <span className={'font-medium'}>Function Name</span>
                    <CustomCombobox
                        defaultValue={
                            agentConfig?.action?.function_name || 'SendAda Token'
                        }
                        itemsList={filteredAgentFunctions}
                        onSelect={(function_name: string) => {
                            const parameter =
                                AGENT_TRIGGER[function_name as AgentTriggerFunctionType]
                                    ?.parameter;
                            const filteredParams = parameter?.map((param) => ({
                                name: param.name,
                                description: param.description,
                                value: ''
                            }));
                            setLocalAgentActionConfigurations({
                                function_name,
                                parameter: filteredParams
                            });
                        }}
                    />
                </div>
                <div className={'flex flex-col gap-1'}>
                    <span className={'font-medium'}>Parameters</span>
                    <div className={'grid grid-cols-2 gap-2'}>
                        {localAgentActionConfigurations?.parameter?.map(
                            (param, index) => {
                                return (
                                    <div className={'flex flex-col gap-2'} key={index}>
                                        <span
                                            className={'text-sm text-brand-Black-300'}
                                        >
                                            {param?.description}
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
                            }
                        )}
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

export default UpdateAgentFunctionModal;

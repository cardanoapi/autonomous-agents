'use client';

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import { IAgentConfiguration, ICronTrigger } from '@api/agents';
import { AgentFunctions } from '@consts';
import { AgentTriggerFunctionType } from '@models/types';
import { getFunctionParameters } from '@utils';

import TriggerTab, {
    IInputSetting
} from '@app/app/(pages)/templates/create-template/components/utils/TriggerTab';
import { Button } from '@app/components/atoms/Button';
import { CustomCombobox } from '@app/components/molecules/CustomCombobox';
import ProbabilityInput from '@app/components/molecules/ProbabilityInput';
import { Separator } from '@app/components/shadcn/ui/separator';
import { determineCronTabAndSection } from '@app/utils/dateAndTimeUtils';

type TriggerType = 'CRON' | 'EVENT';

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

    const [functionList, setFunctionList] = useState(
        AgentFunctions.map((item) => item.function_name)
    );

    const agentConfig = agentConfigs![agentConfigIndex];
    const defaultProbabilityStringValue = (
        ((agentConfig?.data as ICronTrigger)?.probability || 1) * 100
    ).toString();

    const [triggerType, setTriggerType] = useState<TriggerType>('CRON');
    const [cronExpression, setCronExpression] = useState(['*', '*', '*', '*', '*']);
    const cronSetting = determineCronTabAndSection(
        (agentConfig?.data as ICronTrigger)?.frequency || '* * * * *'
    );
    const [defaultSelected, setDefaultSelected] = useState<string>(
        cronSetting?.tab || 'Minute-option-one'
    );
    const [configuredSettings, setConfiguredSettings] = useState<IInputSetting[]>(
        cronSetting?.values || [{ name: `Minute-option-one`, value: 1 }]
    );

    function updateCronExpression(
        cronExpression: any,
        selectedOption: string,
        currentSettings: any
    ) {
        setDefaultSelected(selectedOption);
        setCronExpression(cronExpression);
        setConfiguredSettings(currentSettings);
    }

    const [localAgentActionConfigurations, setLocalAgentActionConfigurations] =
        useState<{
            function_name: string;
            parameters: Array<{ name: string; description?: string; value: string }>;
        }>({
            function_name: '',
            parameters: []
        });

    useEffect(() => {
        if (agentConfig && agentConfig.action) {
            setLocalAgentActionConfigurations(agentConfig.action);
        }
    }, [agentConfig]);

    const [probability, setProbability] = useState<string>(
        defaultProbabilityStringValue
    );

    const handleInputParamsChange = (value: string, index: number) => {
        localAgentActionConfigurations.parameters[index].value = value;
        setLocalAgentActionConfigurations({ ...localAgentActionConfigurations });
    };

    const handleTriggerTypeSelection = (triggerType: TriggerType) => {
        if (triggerType === 'EVENT') {
            setFunctionList(['voteOnProposal']);
            // const filteredParams = getFunctionParameters(
            //     'voteOnProposal' as AgentTriggerFunctionType
            // );
            setLocalAgentActionConfigurations({
                function_name: 'voteOnProposal',
                parameters: []
            });
        } else {
            setFunctionList(AgentFunctions.map((item) => item.function_name));
            const filteredParams = getFunctionParameters(
                'transferADA' as AgentTriggerFunctionType
            );
            setLocalAgentActionConfigurations({
                function_name: 'transferADA',
                parameters: filteredParams || []
            });
        }
        setTriggerType(triggerType);
    };

    const handleFunctionSelection = (function_name: string) => {
        const paramsWithDescription = getFunctionParameters(
            function_name as AgentTriggerFunctionType
        );
        const filteredParams = paramsWithDescription?.map((param, index) => ({
            ...param,
            value: localAgentActionConfigurations.parameters[index]?.value || ''
        }));
        setLocalAgentActionConfigurations({
            function_name,
            parameters: filteredParams || []
        });
    };

    const handleClickSave = () => {
        const filteredParams = localAgentActionConfigurations.parameters.map(
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
                        parameters: filteredParams
                    },
                    data:
                        triggerType === 'CRON'
                            ? {
                                  ...(agentConfig?.data as ICronTrigger),
                                  probability: probability ? +probability / 100 : 0,
                                  frequency: cronExpression.join(' ')
                              }
                            : {
                                  event: 'VoteEvent',
                                  parameters: []
                              },
                    type: triggerType,
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
                <div className={'flex justify-between'}>
                    <div className={'flex flex-col gap-1'}>
                        <span className={'font-medium'}>Function Name</span>
                        <CustomCombobox
                            defaultValue={localAgentActionConfigurations.function_name}
                            itemsList={functionList}
                            onSelect={(function_name: string) =>
                                handleFunctionSelection(function_name)
                            }
                        />
                    </div>
                    <div className={'flex flex-col gap-1'}>
                        <CustomCombobox
                            defaultValue={agentConfig?.type || 'CRON'}
                            itemsList={['CRON', 'EVENT']}
                            onSelect={(triggerType) =>
                                handleTriggerTypeSelection(triggerType as TriggerType)
                            }
                            className={'w-fit rounded-md border-[2px] px-2'}
                        />
                    </div>
                </div>
                {triggerType === 'CRON' ? (
                    <div className={'flex flex-col gap-1'}>
                        <span className={'font-medium'}>Parameters</span>
                        <div className={'grid grid-cols-2 gap-2'}>
                            {localAgentActionConfigurations?.parameters?.map(
                                (param, index) => {
                                    return (
                                        <div
                                            className={'flex flex-col gap-2'}
                                            key={index}
                                        >
                                            <span
                                                className={
                                                    'text-sm text-brand-Black-300'
                                                }
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
                ) : (
                    <></>
                )}
                {triggerType === 'CRON' && (
                    <div className={'flex flex-col gap-4'}>
                        <TriggerTab
                            onChange={updateCronExpression}
                            defaultCron={cronExpression}
                            previousSelectedOption={defaultSelected}
                            previousConfiguredSettings={configuredSettings}
                            onlyCronTriggerTab
                        />
                        <div className={'flex flex-col gap-1'}>
                            <span className={'font-medium'}>Probability</span>
                            <ProbabilityInput
                                onInputChange={(probability: string) =>
                                    setProbability(probability)
                                }
                                defaultValue={defaultProbabilityStringValue}
                            />
                        </div>
                    </div>
                )}
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

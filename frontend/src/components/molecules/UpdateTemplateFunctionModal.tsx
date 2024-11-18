// 'use client';

// import React, { useEffect, useState } from 'react';

// import { useParams } from 'next/navigation';

// import { ICronTrigger, ISubParameter } from '@api/agents';
// import { ITemplateConfiguration } from '@api/templates';
// import { AgentFunctions } from '@consts';
// import { AgentTriggerFunctionType } from '@models/types';
// import { getFunctionParameters } from '@utils';

// import TriggerTab, {
//     IInputSetting
// } from '@app/app/(pages)/templates/create-template/components/Form/TriggerTab';
// import { Button } from '@app/components/atoms/Button';
// import { CustomCombobox } from '@app/components/molecules/CustomCombobox';
// import ProbabilityInput from '@app/components/molecules/ProbabilityInput';
// import { Separator } from '@app/components/shadcn/ui/separator';
// import { determineCronTabAndSection } from '@app/utils/dateAndTimeUtils';

// type TriggerType = 'CRON' | 'EVENT';

// const UpdateTemplateFunctionModal = ({
//     header,
//     templateConfigIndex,
//     templateConfigs,
//     onClickSave
// }: {
//     header: string;
//     templateConfigIndex: number;
//     templateConfigs?: Array<ITemplateConfiguration>;
//     onClickSave?: (agentConfig: ITemplateConfiguration, index: number) => void;
// }) => {
//     const params = useParams();
//     const templateId = params.templateId as string;

//     const [functionList, setFunctionList] = useState(
//         AgentFunctions.map((item) => item.function_name)
//     );
//     const templateConfig = templateConfigs![templateConfigIndex];

//     const [triggerType, setTriggerType] = useState<TriggerType>('CRON');
//     const [cronExpression, setCronExpression] = useState(['*', '*', '*', '*', '*']);
//     const cronSetting = determineCronTabAndSection(
//         (templateConfig?.data as ICronTrigger)?.frequency || '* * * * *'
//     );
//     const [defaultSelected, setDefaultSelected] = useState<string>(
//         cronSetting?.tab || 'Minute-option-one'
//     );
//     const [configuredSettings, setConfiguredSettings] = useState<IInputSetting[]>(
//         cronSetting?.values || [{ name: `Minute-option-one`, value: 1 }]
//     );

//     function updateCronExpression(
//         cronExpression: any,
//         selectedOption: string,
//         currentSettings: any
//     ) {
//         setDefaultSelected(selectedOption);
//         setCronExpression(cronExpression);
//         setConfiguredSettings(currentSettings);
//     }

//     const defaultProbabilityStringValue = (
//         ((templateConfig?.data as ICronTrigger)?.probability || 1) * 100
//     ).toString();

//     const [localTemplateActionConfigurations, setLocalTemplateActionConfigurations] =
//         useState<{
//             function_name: string;
//             parameters: ISubParameter[];
//         }>({
//             function_name: '',
//             parameters: []
//         });

//     useEffect(() => {
//         if (templateConfig?.action) {
//             setLocalTemplateActionConfigurations(templateConfig.action);
//         }
//     }, [templateConfig]);

//     const [probability, setProbability] = useState<string>(
//         defaultProbabilityStringValue
//     );

//     const handleInputParamsChange = (value: string, index: number) => {
//         localTemplateActionConfigurations.parameters[index].value = value;
//         setLocalTemplateActionConfigurations({ ...localTemplateActionConfigurations });
//     };

//     const handleTriggerTypeSelection = (triggerType: TriggerType) => {
//         if (triggerType === 'EVENT') {
//             setFunctionList(['voteOnProposal']);
//             const filteredParams = getFunctionParameters(
//                 'voteOnProposal' as AgentTriggerFunctionType
//             );
//             setLocalTemplateActionConfigurations({
//                 function_name: 'voteOnProposal',
//                 parameters: filteredParams || []
//             });
//         } else {
//             setFunctionList(AgentFunctions.map((item) => item.function_name));
//             const filteredParams = getFunctionParameters(
//                 'transferADA' as AgentTriggerFunctionType
//             );
//             setLocalTemplateActionConfigurations({
//                 function_name: 'transferADA',
//                 parameters: filteredParams || []
//             });
//         }
//         setTriggerType(triggerType);
//     };

//     const handleFunctionSelection = (function_name: string) => {
//         const paramsWithDescription = getFunctionParameters(
//             function_name as AgentTriggerFunctionType
//         );
//         const filteredParams = paramsWithDescription?.map((param, index) => ({
//             ...param,
//             value: localTemplateActionConfigurations.parameters[index]?.value || ''
//         }));
//         setLocalTemplateActionConfigurations({
//             function_name,
//             parameters: filteredParams || []
//         });
//     };

//     const handleClickSave = () => {
//         const filteredParams = localTemplateActionConfigurations.parameters.map(
//             (param) => ({
//                 name: param.name,
//                 value: param.value
//             })
//         );
//         onClickSave &&
//             onClickSave(
//                 {
//                     ...templateConfig,
//                     action: {
//                         ...templateConfig?.action,
//                         function_name: localTemplateActionConfigurations.function_name,
//                         parameters: filteredParams
//                     },
//                     data:
//                         triggerType === 'CRON'
//                             ? {
//                                   ...(templateConfig?.data as ICronTrigger),
//                                   probability: probability ? +probability / 100 : 0,
//                                   frequency: cronExpression.join(' ')
//                               }
//                             : {
//                                   event: 'VoteEvent',
//                                   parameters: []
//                               },
//                     type: triggerType,
//                     template_id: templateConfig
//                         ? templateConfig.template_id
//                         : templateId,
//                     id: templateConfig ? templateConfig.id : ''
//                 },
//                 templateConfigIndex
//             );
//     };

//     return (
//         <div className={'bg-white'}>
//             <div className={'px-5 py-2'}>{header}</div>
//             <Separator />
//             <div className={'flex flex-col gap-4 p-5'}>
//                 <div className={'flex justify-between'}>
//                     <div className={'flex flex-col gap-1'}>
//                         <span className={'font-medium'}>Function Name</span>
//                         <CustomCombobox
//                             defaultValue={
//                                 localTemplateActionConfigurations.function_name
//                             }
//                             itemsList={functionList}
//                             onSelect={(function_name: string) =>
//                                 handleFunctionSelection(function_name)
//                             }
//                         />
//                     </div>
//                     <div className={'flex flex-col gap-1'}>
//                         <CustomCombobox
//                             defaultValue={templateConfig?.type || 'CRON'}
//                             itemsList={['CRON', 'EVENT']}
//                             onSelect={(triggerType) =>
//                                 handleTriggerTypeSelection(triggerType as TriggerType)
//                             }
//                             className={'w-fit rounded-md border-[2px] px-2'}
//                         />
//                     </div>
//                 </div>
//                 <div className={'flex flex-col gap-1'}>
//                     <span className={'font-medium'}>Parameters</span>
//                     <div className={'grid grid-cols-2 gap-2'}>
//                         {localTemplateActionConfigurations?.parameters?.map(
//                             (param, index) => {
//                                 return (
//                                     <div
//                                         className={'flex flex-col gap-2'}
//                                         key={param.name}
//                                     >
//                                         <span
//                                             className={'text-sm text-brand-Black-300'}
//                                         >
//                                             {param?.name}
//                                         </span>
//                                         <input
//                                             value={param.value}
//                                             onChange={(e) =>
//                                                 handleInputParamsChange(
//                                                     e.target.value,
//                                                     index
//                                                 )
//                                             }
//                                             type="text"
//                                             className={
//                                                 'w-11/12 rounded border border-brand-Black-100/80 px-2 py-1'
//                                             }
//                                         />
//                                     </div>
//                                 );
//                             }
//                         )}
//                     </div>
//                 </div>
//                 {triggerType === 'CRON' && (
//                     <div className={'flex flex-col gap-4'}>
//                         <TriggerTab
//                             onChange={updateCronExpression}
//                             defaultCron={cronExpression}
//                             previousSelectedOption={defaultSelected}
//                             previousConfiguredSettings={configuredSettings}
//                             onlyCronTriggerTab
//                         />
//                         <div className={'flex flex-col gap-1'}>
//                             <span className={'font-medium'}>Probability</span>
//                             <ProbabilityInput
//                                 onInputChange={(probability: string) =>
//                                     setProbability(probability)
//                                 }
//                                 defaultValue={defaultProbabilityStringValue}
//                             />
//                         </div>
//                     </div>
//                 )}
//                 <Button
//                     onClick={handleClickSave}
//                     className={'relative right-0 w-1/4'}
//                     variant={'primary'}
//                 >
//                     Save
//                 </Button>
//             </div>
//         </div>
//     );
// };

// export default UpdateTemplateFunctionModal;

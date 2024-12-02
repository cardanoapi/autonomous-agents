import { IAgentConfiguration, ICronTrigger } from '@api/agents';
import { ITemplateConfiguration } from '@api/templates';
import { TemplateFunctions } from '@models/types/functions';
import { Edit, Trash2 } from 'lucide-react';
import {cn} from '@app/components/lib/utils'

import { convertCRONExpressionToReadableForm } from '@app/utils/dateAndTimeUtils';

import CustomCopyBox from '../shared/CustomCopyBox';

const FunctionCardWithMeta = ({
    config,
    onClickDelete,
    enableContol,
    handleClickEdit,
    className
}: {
    config: IAgentConfiguration | ITemplateConfiguration;
    onClickDelete?: (configId: string) => void;
    enableContol?: boolean;
    handleClickEdit?: (config: IAgentConfiguration | ITemplateConfiguration) => void;
    className?: string
}) => {
    const getFunctionMetaData = (functionName: string) => {
        return TemplateFunctions.find((f) => f.id === functionName);
    };
    const renderConfigMeta = (config: IAgentConfiguration | ITemplateConfiguration) => {
        const functionMetaData = getFunctionMetaData(
            config.action?.function_name || ''
        );

        return (
            <>
                <span className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-700">
                    {functionMetaData?.name || config.action?.function_name}{' '}
                    <span className="w-fit rounded-xl bg-blue-100 px-2 py-[1px] text-[10px] font-semibold">
                        {config.type}
                    </span>
                </span>
                <span className="text-[10px] text-gray-700">
                    {functionMetaData?.description || 'No description'}
                </span>
            </>
        );
    };

    return (
        <div
            className={cn("group relative flex w-full flex-col flex-wrap justify-between gap-2 rounded bg-brand-White-200 p-3 drop-shadow-md md:w-[300px]" , className)}
            key={`${config.id}`}
        >
            {enableContol && (
                <div className="absolute right-3 top-3 hidden items-center gap-2 group-hover:flex">
                    <Edit
                        className="cursor-pointer text-gray-400"
                        size={20}
                        onClick={() => handleClickEdit?.(config)}
                    />
                    <Trash2
                        className="cursor-pointer text-red-400 group-hover:flex"
                        size={20}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClickDelete && onClickDelete(config.id);
                        }}
                    />
                </div>
            )}

            <div className="flex flex-col">{renderConfigMeta(config)}</div>
            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-4 px-1">
                <CustomCopyBox
                    title="Trigger Probability"
                    content={`${(config.data as ICronTrigger).probability * 100 || 100}%`}
                    className="w-auto"
                    showCopyIcon={false}
                />
                {config.type === 'CRON' && (
                    <CustomCopyBox
                        title="Cron Expression"
                        content={convertCRONExpressionToReadableForm(
                            (config.data as ICronTrigger).frequency
                        )}
                        className="w-auto"
                        showCopyIcon={false}
                    />
                )}
                {config.action?.parameters.map((param, index) =>
                    typeof param.value === 'object' &&
                    !Array.isArray(param.value) &&
                    param.value !== null &&
                    param.value !== undefined ? (
                        Object.entries(param.value).map(([key, value], subIndex) => (
                            <CustomCopyBox
                                title={key}
                                content={value?.toString() || ''}
                                key={subIndex}
                                className="w-auto"
                                iconClassName="text-gray-500"
                                showCopyIcon={false}
                                copyOnContentClick={true}
                            />
                        ))
                    ) : (
                        <CustomCopyBox
                            title={param.name}
                            content={param.value?.toString() || ''}
                            key={index}
                            className="w-auto"
                            iconClassName="text-gray-500"
                            showCopyIcon={false}
                            copyOnContentClick={true}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default FunctionCardWithMeta;

import React, { useEffect, useState } from 'react';

import { IParameter } from '@api/functions';

import GroupParams from '@app/components/Agent/GroupParameters';
import { Input } from '@app/components/atoms/Input';

const FunctionParameters = ({
    parameters,
    errorIndex
}: {
    parameters: IParameter[];
    errorIndex: Array<number>;
}) => {
    const [params, setParams] = useState(parameters);
    const [errorParamIndex, setErrorParamIndex] = useState<Array<number>>(errorIndex);

    useEffect(() => {
        errorIndex.length && setErrorParamIndex(errorIndex);
    }, [errorIndex]);

    const handleInputChange = (
        value: string,
        index: number,
        isGroupParams: boolean = false,
        groupIndex: number = 0
    ) => {
        const updatedParams = [...params];
        if (isGroupParams && updatedParams.length) {
            const group = updatedParams[groupIndex];
            if (group && group.parameters && group.parameters[index]) {
                group.parameters[index] = {
                    ...group.parameters[index],
                    value
                };
            }
            updatedParams[groupIndex] = group;
        } else {
            updatedParams[index] = { ...updatedParams[index], value };
        }
        setParams(updatedParams);
        const newErrorIndex = errorParamIndex.filter(
            (errIndex: number) => errIndex != index
        );
        setErrorParamIndex(newErrorIndex);
    };

    return params.map((param, index: number) => {
        return param.data_type !== 'group' ? (
            <div key={index} className={'flex flex-col gap-1'}>
                <span>
                    {param.description}{' '}
                    {param.optional ? (
                        <></>
                    ) : (
                        <span className={'mt-2 text-lg text-red-500'}>*</span>
                    )}
                </span>
                <Input
                    value={params[index].value}
                    onChange={(e) => handleInputChange(e.target.value, index)}
                />
                {errorParamIndex.length && errorParamIndex.includes(index) ? (
                    <span className={'text-sm text-red-500'}>
                        This field is required.
                    </span>
                ) : (
                    <></>
                )}
            </div>
        ) : (
            <GroupParams
                key={index}
                isError={errorParamIndex.includes(index)}
                param={param}
                handleOnChange={(groupParamVal: string, groupParamIndex: number) => {
                    handleInputChange(groupParamVal, groupParamIndex, true, index);
                }}
            />
        );
    });
};

export default FunctionParameters;

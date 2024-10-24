import React, { useState } from 'react';

import { IParameter } from '@api/functions';

import { Input } from '@app/components/atoms/Input';

const GroupParams = ({
    isError,
    param,
    handleOnChange
}: {
    isError: boolean;
    param: IParameter;
    handleOnChange: (val: string, index: number) => void;
}) => {
    const [parameter, setParameter] = useState(param);

    function checkForErrMsg(index: number) {
        if (parameter.optional) {
            return (
                checkIfParameterIsRequired(index) && !parameter.parameters![index].value
            );
        }
        return (
            checkIfParameterIsRequired(index) &&
            !parameter.parameters![index].value &&
            isError
        );
    }

    function checkIfParameterIsRequired(index: number) {
        if (parameter.optional) {
            const isAnyFieldFilled =
                parameter.parameters?.some(
                    (param) =>
                        param.value !== '' &&
                        param.value !== undefined &&
                        param.value !== null
                ) || false;
            return isAnyFieldFilled ? !parameter.parameters![index].optional : false;
        } else {
            return !parameter.parameters![index].optional;
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const updatedParam = { ...parameter };
        updatedParam.parameters![index] = {
            ...parameter.parameters![index],
            value: e.target.value
        };
        setParameter({ ...updatedParam });
        handleOnChange(e.target.value, index);
    };
    return (
        <div className={'flex flex-col'}>
            <span>
                {parameter.description}{' '}
                {parameter.optional ? (
                    <></>
                ) : (
                    <span className={'text-lg text-red-500'}>*</span>
                )}
            </span>
            <div className={'flex flex-row gap-4'}>
                {parameter.parameters?.length &&
                    parameter.parameters?.map((param, index) => {
                        return (
                            <div
                                key={`${param.name}-${index}`}
                                className={'flex flex-col gap-1'}
                            >
                                <div
                                    className={
                                        'flex flex-row items-start gap-1 text-sm'
                                    }
                                >
                                    {param.description}{' '}
                                    {checkIfParameterIsRequired(index) ? (
                                        <span className={'text-red-500'}>*</span>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                                <Input
                                    value={parameter.parameters![index].value}
                                    onChange={(e) => handleInputChange(e, index)}
                                />
                                {checkForErrMsg(index) && (
                                    <span className={'text-xs text-red-500'}>
                                        This field is required.
                                    </span>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default GroupParams;

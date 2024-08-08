import React, { useEffect, useState } from 'react';

import { IParameter } from '@models/types/functions';
import { useAtom } from 'jotai';
import { useDebounceValue } from 'usehooks-ts';

import { Input } from '@app/components/atoms/Input';
import { errorAtom, selectedFunctionAtom } from '@app/store/atoms/formRenderer';
import { checkIfToFillAnyOneField } from '@app/utils/formRenderer';

const ObjectParameter = ({
    paramIndex,
    parameter
}: {
    paramIndex: number;
    parameter: IParameter;
}) => {
    const [selectedFunction, setSelectedFunction] = useAtom(selectedFunctionAtom);
    const [errorIndex] = useAtom(errorAtom);

    const [params, setParams] = useState(parameter.parameters || []);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (errorIndex.includes(paramIndex)) {
            const errorText = checkIfToFillAnyOneField(parameter)
                ? 'Please fill any one field'
                : 'Please fill all required fields.';
            setErrorMsg(errorText);
        }
    }, [errorIndex]);

    useEffect(() => {
        const updatedParams =
            parameter.parameters?.map((param) => ({ ...param, value: '' })) || [];
        setParams([...updatedParams]);
    }, []);

    useEffect(() => {
        if (errorMsg) {
            const clearErrMsgTimeout = setTimeout(() => {
                setErrorMsg('');
            }, 3000);
            return () => clearTimeout(clearErrMsgTimeout);
        }
    }, [errorMsg]);

    const handleOnChange = (value: any, index: number) => {
        params[index].value = value;
        setParams([...params]);
    };

    const [debouncedVal] = useDebounceValue(params, 300);

    useEffect(() => {
        if (debouncedVal && selectedFunction && selectedFunction.parameters?.length) {
            const param = selectedFunction.parameters[paramIndex];
            if (
                param?.options &&
                param.parameters?.length &&
                param.parameters[0]?.parameters
            ) {
                param.parameters[0].parameters = debouncedVal;
            } else {
                if (param) {
                    param.parameters = debouncedVal;
                }
            }
            setSelectedFunction({ ...selectedFunction });
        }
    }, [debouncedVal]);

    return (
        <div className={'grid grid-cols-2 gap-2'}>
            {params?.length &&
                params.map((param, index) => {
                    return (
                        <div key={param.id} className={'flex flex-col gap-1'}>
                            <div className={'flex gap-1'}>
                                {param.name}
                                {!param.optional && (
                                    <span className={'text-red-500'}>*</span>
                                )}
                            </div>
                            <div className={'flex flex-row gap-1'}>
                                <Input
                                    placeholder={param.name}
                                    value={param.value}
                                    onChange={(e) =>
                                        handleOnChange(e.target.value, index)
                                    }
                                    type={param.type === 'number' ? 'number' : 'text'}
                                />
                            </div>
                            {errorMsg && !param.value && (
                                <span className={'text-xs text-red-500'}>
                                    {errorMsg}
                                </span>
                            )}
                        </div>
                    );
                })}
        </div>
    );
};

export default ObjectParameter;

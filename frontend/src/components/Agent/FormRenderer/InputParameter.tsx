import { useEffect, useState } from 'react';

import { IParameter } from '@models/types/functions';
import { useAtom } from 'jotai';
import { useDebounceValue } from 'usehooks-ts';

import { Input } from '@app/components/atoms/Input';
import { errorAtom, selectedFunctionAtom } from '@app/store/atoms/formRenderer';

const InputParameter = ({ parameter, paramIndex }: { parameter: IParameter; paramIndex: number }) => {
    const [selectedFunction, setSelectedFunction] = useAtom(selectedFunctionAtom);
    const [errorIndex] = useAtom(errorAtom);

    const [errMsg, setErrMsg] = useState('');
    const [value, setValue] = useState('');

    const [debouncedValue] = useDebounceValue(value, 300);

    useEffect(() => {
        if (errorIndex.includes(paramIndex)) {
            setErrMsg('Please fill all required fields.');
        }
    }, [errorIndex]);

    useEffect(() => {
        if (errMsg) {
            const errorTimeout = setTimeout(() => setErrMsg(''), 3000);
            return () => clearTimeout(errorTimeout);
        }
    }, [errMsg]);

    useEffect(() => {
        if (selectedFunction && selectedFunction.parameters) {
            selectedFunction.parameters[paramIndex] = {
                ...selectedFunction.parameters[paramIndex],
                value: debouncedValue
            };
            setSelectedFunction({ ...selectedFunction });
        }
    }, [debouncedValue]);

    return (
        <div className={'flex flex-col gap-1'}>
            <div className={'flex flex-row gap-1'}>
                <Input
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setErrMsg('');
                    }}
                    type={parameter.type === 'number' ? 'number' : 'text'}
                    placeholder={parameter.name}
                />
                {!parameter.optional && <span className={'text-red-500'}>*</span>}
            </div>
            {errMsg && <span className={'text-xs text-red-500'}>{errMsg} </span>}
        </div>
    );
};

export default InputParameter;

'use client';

import React, { useEffect, useState } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

const ProbabilityInput = ({
    onInputChange,
    defaultValue = '100'
}: {
    onInputChange: (args: string) => void;
    defaultValue?: string;
}) => {
    const [value, setValue] = useState<string>(defaultValue);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (errorMsg) {
            const clearErrorMsg = setTimeout(() => {
                setErrorMsg('');
            }, 3000);
            return () => clearTimeout(clearErrorMsg);
        }
    }, [errorMsg]);
    const handleProbabilityChange = (value: string) => {
        setErrorMsg('');
        if (!value) {
            setValue('');
        } else {
            if (+value < 0 || +value > 100) {
                setErrorMsg('Value cannot be less than 0 or greater than 100');
                return;
            } else setValue(value);
        }
    };

    useEffect(() => {
        onInputChange(value);
    }, [value]);

    return (
        <div className={'flex flex-col gap-2'}>
            <div
                className={
                    'relative flex w-fit flex-row items-center rounded border  border-brand-Black-300 px-1'
                }
            >
                <input
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleProbabilityChange(e.target.value)
                    }
                    className={'w-[140px] px-1 py-2 text-center outline-none'}
                    type={'text'}
                />
                <div className={'absolute right-4 flex flex-col'}>
                    <ChevronUp
                        className={'h-4 w-4 cursor-pointer'}
                        onClick={() => handleProbabilityChange((+value + 1).toString())}
                    />
                    <ChevronDown
                        className={'h-4 w-4 cursor-pointer active:scale-105'}
                        onClick={() => handleProbabilityChange((+value - 1).toString())}
                    />
                </div>
            </div>

            {errorMsg ? (
                <span className={' text-xs text-red-500'}>{errorMsg}</span>
            ) : (
                <span className={'h-4'}></span>
            )}
        </div>
    );
};

export default ProbabilityInput;

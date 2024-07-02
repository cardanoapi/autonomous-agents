'use client';

import * as React from 'react';
import { useEffect } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

export function Combobox({
    defaultValue,
    itemsList,
    onSelect
}: {
    defaultValue?: string;
    itemsList: Array<string>;
    onSelect: (arg: string) => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(defaultValue || '');
    useEffect(() => {
        value && onSelect(value);
    }, [value]);

    return (
        <div
            onClick={() => setOpen(!open)}
            className={'relative w-[300px] cursor-pointer border-b border-gray-600'}
        >
            <div className={'flex flex-row justify-between'}>
                <span>{value ? value : ' Select Function Name'}</span>
                {open ? <ChevronUp /> : <ChevronDown />}
            </div>
            {open && itemsList.length && (
                <div
                    className={
                        'absolute z-10 mt-2 flex w-full flex-col gap-1 rounded-md bg-white py-2 drop-shadow-lg'
                    }
                >
                    {itemsList.map((item: string) => {
                        return (
                            <div
                                onClick={() => {
                                    setValue(item);
                                    setOpen(false);
                                }}
                                key={item}
                                className={'px-2 hover:bg-gray-200'}
                            >
                                {item}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

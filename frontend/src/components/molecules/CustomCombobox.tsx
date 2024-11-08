'use client';

import * as React from 'react';
import { useEffect } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@app/components/shadcn/lib/utils';

export function CustomCombobox({
    defaultValue,
    itemsList,
    onSelect,
    className,
    isOpen = false
}: {
    defaultValue?: string;
    itemsList: Array<string>;
    onSelect: (arg: string) => void;
    className?: string;
    isOpen?: boolean;
}) {
    const [open, setOpen] = React.useState(isOpen);
    const [value, setValue] = React.useState(defaultValue || '');

    useEffect(() => {
        defaultValue && setValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        value && onSelect(value);
    }, [value]);

    return (
        <div
            onClick={() => setOpen(!open)}
            className={cn(
                'relative w-[300px] cursor-pointer border-b border-gray-600',
                className
            )}
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

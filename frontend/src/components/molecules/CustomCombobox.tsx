'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@app/components/lib/utils';

interface ItemSchema {
    id: string | string[];
    label: string;
}

export function CustomCombobox({
    defaultValue,
    itemsList,
    onSelect,
    className,
    isOpen = false,
    addSearchOption = false,
    disabled = false
}: {
    defaultValue?: ItemSchema;
    itemsList: Array<ItemSchema>;
    onSelect: (value: any) => void;
    className?: string;
    isOpen?: boolean;
    addSearchOption?: boolean;
    disabled?: boolean;
}) {
    const [open, setOpen] = React.useState(isOpen);
    const [value, setValue] = React.useState(defaultValue || null);
    const [searchValue, setSearchValue] = React.useState('');
    const [items, setItems] = React.useState<Array<ItemSchema>>(itemsList);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (modalRef.current && !modalRef?.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    useEffect(() => {
        itemsList && setItems(itemsList);
    }, [itemsList]);

    useEffect(() => {
        value && onSelect(value.id);
    }, [value]);

    const handleOnChange = (searchValue: string) => {
        const newItems = itemsList.filter((item) =>
            item.label.toLowerCase().includes(searchValue.toLowerCase())
        );
        setItems(newItems);
        setSearchValue(searchValue);
    };
    return (
        <div
            onClick={() => setOpen(!open)}
            className={cn(
                'relative w-[300px] cursor-pointer border-gray-600',
                disabled && 'cursor-not-allowed border-slate-300 text-slate-400',
                addSearchOption ? '' : 'border-b ',
                className
            )}
        >
            <div className={'flex flex-row justify-between'}>
                {addSearchOption ? (
                    <input
                        disabled={disabled}
                        className={cn(
                            'w-full rounded-lg border border-brand-Black-100/50 px-3 py-1.5 outline-1 outline-brand-Black-100/20',
                            disabled ? 'cursor-not-allowed' : ''
                        )}
                        type="text"
                        placeholder={value ? value.label : ''}
                        value={searchValue}
                        onClick={() => setOpen(true)}
                        onChange={(e) => handleOnChange(e.target.value)}
                    />
                ) : (
                    <span>{value ? value.label : ' Select Function Name'}</span>
                )}
                {addSearchOption ? <></> : open ? <ChevronUp /> : <ChevronDown />}
            </div>
            {open && items.length ? (
                <div
                    ref={modalRef}
                    className={cn(
                        'absolute z-10 mt-2 flex flex-col gap-1 rounded-md bg-white py-2 drop-shadow-lg',
                        addSearchOption ? '-left-1/2 w-fit min-w-[600px]' : 'w-full'
                    )}
                >
                    {items.map((item) => {
                        return (
                            <div
                                onClick={() => {
                                    if (addSearchOption) {
                                        onSelect(item.id);
                                        setSearchValue('');
                                    } else {
                                        setValue(item);
                                    }
                                    setOpen(false);
                                }}
                                key={item.label}
                                className={'px-2 hover:bg-gray-200'}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}

'use client';

import * as React from 'react';

import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '../atoms/Button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem
} from '../atoms/Command';
import { Popover, PopoverContent, PopoverTrigger } from '../atoms/Popover';
import { cn } from '../lib/utils';

export interface IComboBoxOption {
    value: string;
    label: string;
}

export interface ComboboxProps extends React.HTMLAttributes<HTMLDivElement> {
    options?: IComboBoxOption[];
    enableSearch?: boolean;
    className?: string;
}

const Combobox: React.FC<ComboboxProps> = ({
    options,
    enableSearch = false,
    onSelect,
    className,
    ...rest
}) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('');

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? options?.find((option) => option.value === value)?.label
                        : 'Select Option...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn('h-full w-full bg-white', className)}
                {...rest}
            >
                <Command>
                    {enableSearch && (
                        <CommandInput
                            placeholder="Search framework..."
                            className={cn(enableSearch ? '' : 'hidden')}
                        />
                    )}
                    <CommandEmpty>No such option found.</CommandEmpty>
                    <CommandGroup>
                        {options?.map((option) => (
                            <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={(currentValue) => {
                                    setValue(
                                        currentValue === value ? '' : currentValue
                                    );
                                    setOpen(false);
                                }}
                                onClick={(e) => {
                                    setValue((e.target as HTMLInputElement).value);
                                    setOpen(false);
                                }}
                                className="hover:cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value === option.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default Combobox;

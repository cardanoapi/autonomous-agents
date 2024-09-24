import React from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';


import { IFieldMetaData } from '../data/EventTypes';

interface FieldSelectorProps {
    options: IFieldMetaData[];
    onSelectField: any;
    triggerValue: string;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({
    options,
    onSelectField,
    triggerValue
}) => {
    const handleValueChange = (value: string) => {
        onSelectField(options.find((field) => field.label === value) || options[0]);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="flex justify-between rounded-lg  bg-white p-2 px-6"
                renderChevronIcon={true}
            >
                {triggerValue}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[420px]">
                {options.map((field) => (
                    <DropdownMenuItem
                        key={field.label}
                        onClick={() => handleValueChange(field.label)}
                    >
                        tx.{field.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

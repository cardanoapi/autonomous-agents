import React from 'react';

import { SelectValue } from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Trash } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { Input } from '@app/components/atoms/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from '@app/components/atoms/Select';
import { cn } from '@app/components/lib/utils';
import { NumberInput } from '@app/components/molecules/NumberInput';

import { IConfiguredField } from '../EventMainTab';

interface FilterFieldsProps {
    fields: IConfiguredField[];
    onFieldUpate: (data: IConfiguredField) => void;
    onFieldDelete: (index: number) => void;
    className?: string;
}

export const FilterFields: React.FC<FilterFieldsProps> = ({
    fields,
    onFieldUpate,
    className,
    onFieldDelete
}) => {
    const handleFieldUpdate = (
        field: IConfiguredField,
        newValue: any,
        newOperator: string
    ) => {
        onFieldUpate({
            ...field,
            value: newValue,
            operator: newOperator
        });
    };

    const renderField = (field: IConfiguredField) => {
        const effectiveValue =
            field.value !== undefined ? field.value : field.defaultValue;

        return (
            <div
                key={field.name}
                className={cn(
                    'grid grid-cols-[30%,14%,40%,10%] items-center justify-between gap-2',
                    className
                )}
            >
                <div className="text-sm text-gray-800">tx.{field.label}</div>

                {field.operators && field.type != 'enum' && (
                    <div className="relative">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="flex w-fit"
                                disableIcon={true}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white px-2 py-1 text-sm">
                                    {field.operator || field.operators[0]}
                                </div>
                                <div className="flex transform cursor-pointer flex-col gap-1">
                                    <ChevronUp size={12} />
                                    <ChevronDown size={12} />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-8 min-w-fit">
                                {field.operators.map((op: any) => (
                                    <DropdownMenuItem
                                        key={op}
                                        onClick={() =>
                                            handleFieldUpdate(field, effectiveValue, op)
                                        }
                                        className="w-4"
                                    >
                                        {op}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {field.type === 'enum' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-transparent px-2 py-1 text-sm"></div>
                )}

                {field.type === 'number' && (
                    <NumberInput
                        className="h-8 w-full"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleFieldUpdate(
                                field,
                                e.target.value,
                                field.operator || '='
                            )
                        }
                        defaultValue={effectiveValue || 1}
                    />
                )}
                {(field.type === 'string' || field.type === 'buffer') && (
                    <Input
                        className="h-8 w-full"
                        onChange={(e) =>
                            handleFieldUpdate(
                                field,
                                e.target.value,
                                field.operator || '='
                            )
                        }
                        defaultValue={effectiveValue || ''}
                    />
                )}
                {field.type === 'enum' && (
                    <Select
                        onValueChange={(e) =>
                            handleFieldUpdate(field, e, field.operator || '=')
                        }
                    >
                        <SelectTrigger className="h-8 text-sm ">
                            <SelectValue
                                placeholder={field.value || 'Select Option'}
                                className="!text-sm placeholder:!text-sm placeholder:font-light"
                            ></SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Trash
                    className="cursor-pointer text-gray-400"
                    onClick={() => onFieldDelete(field.index)}
                />
            </div>
        );
    };

    return <div className="flex flex-col gap-2">{fields.map(renderField)}</div>;
};

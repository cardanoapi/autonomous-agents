import React, { useState } from 'react';

import { X } from 'lucide-react';

import { Button } from '@app/components/atoms/Button';
import { Input } from '@app/components/atoms/Input';
import { NumberInput } from '@app/components/molecules/NumberInput';

import { IConfiguredEventFilter } from './EventTab';
import { IFieldMetaData } from './EventTypes';

export const FilterConfiguration = ({
    selectedFilter,
    onClose,
    onSave
}: {
    selectedFilter: IFieldMetaData;
    onClose: () => void;
    onSave: any;
}) => {
    const [currentConfig, setCurrentConfig] = useState<IConfiguredEventFilter[]>(
        () =>
            selectedFilter.fields?.map((field) => ({
                name: field.label,
                value: null
            })) || []
    );

    const handleSave = () => {
        onSave(currentConfig);
        onClose();
    };

    const handleConfigUpdate = (name: string, value: any) => {
        console.log(name, value);
        const newValues = currentConfig.filter((item) => item.name != name);
        newValues.push({ name, value });
        setCurrentConfig(newValues);
    };
    const renderFilterForm = (fields: IFieldMetaData[]) => {
        return (
            <div className="flex flex-col gap-4">
                {fields.map((field) => (
                    <div key={field.label} className="flex items-center gap-4">
                        <span className="inline-flex w-32">{field.label}:</span>
                        <div className="w-96">
                            {field.type === 'number' ? (
                                <NumberInput
                                    className="pl-2"
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                        handleConfigUpdate(field.label, e.target.value)
                                    }
                                />
                            ) : (
                                <Input
                                    onChange={(e: any) =>
                                        handleConfigUpdate(field.label, e.target.value)
                                    }
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="relative mt-4 flex flex-col gap-4 rounded-xl bg-gray-100 p-6">
            <span className="h4">{selectedFilter?.label}</span>
            <X className="absolute right-2 top-2 cursor-pointer" onClick={onClose} />
            {renderFilterForm(selectedFilter?.fields || [])}
            <Button onClick={handleSave}>Ok</Button>
        </div>
    );
};

import React, { useEffect, useState } from 'react';

import { X } from 'lucide-react';

import { Badge } from '@app/components/atoms/Badge';
import { Button } from '@app/components/atoms/Button';

import { IConfiguredField, IConfiguredTrigger } from '../EventMainTab';
import {
    IFieldMetaData,
    getfieldsbyFilterLabel
} from '../data/EventTypes';
import { FieldSelector } from './FieldSelector';
import { FilterFields } from './FilterFields';

interface FilterFormProps {
    selectedFilter?: IFieldMetaData;
    savedData?: IConfiguredTrigger;
    onClose: () => void;
    onSave: (config: IConfiguredField[]) => void;
    isEditing?: boolean;
}

export const FilterForm: React.FC<FilterFormProps> = ({
    selectedFilter,
    onClose,
    savedData,
    onSave,
    isEditing = false
}) => {
    const [currentFields, setCurrentFields] = useState<IConfiguredField[]>(
        savedData?.values || []
    );
    const [fieldOptions, setFieldOptions] = useState<IFieldMetaData[]>(
        (selectedFilter && selectedFilter.fields) || []
    );
    const [sortedFields, setSortedFields] = useState<IConfiguredField[]>([]);

    useEffect(() => {
        if (savedData) {
            const savedFilters = savedData.values.map((item) => item.label);
            const allFields = getfieldsbyFilterLabel(savedData.name);
            const filteredFields = allFields.filter(
                (field) => !savedFilters.includes(field.label)
            );
            setFieldOptions(filteredFields);
        }
    }, [savedData]);
    

    useEffect(() => {
        setSortedFields(currentFields.sort((a, b) => a.label.localeCompare(b.label)));
    }, [currentFields]);

    useEffect(()=>{
        if (selectedFilter){
            setFieldOptions(selectedFilter?.fields || [])
            setCurrentFields([])
        }
    },[selectedFilter])

    const handleTriggerSave = () => {
        onSave(currentFields);
        onClose();
    };

    const handleFieldUpdate = (updatedField: IConfiguredField) => {
        const newFields = currentFields.map((item) => {
            if (item.index === updatedField.index) {
                return updatedField;
            }
            return item;
        });
        setCurrentFields(newFields);
    };

    const handleAddField = (field: IConfiguredField) => {
        setCurrentFields((prev) => [
            ...prev,
            {
                ...field,
                relationship: 'AND',
                index: prev.length
            }
        ]);
        // Remove the selected field from options
        const newOptions = fieldOptions.filter((item) => item.label !== field.label);
        setFieldOptions(newOptions);
    };

    const handleDeleteField = (index: number) => {
        const deletedField = currentFields.find((item) => item.index === index);

        if (deletedField) {
            // Restore the deleted field back to options
            setFieldOptions((prev) => [...prev, deletedField]);
        }

        const newFields = currentFields.filter((item) => item.index !== index);
        const updatedFields = newFields.map((item, i) => ({
            ...item,
            index: i // Re-index remaining fields
        }));
        setCurrentFields(updatedFields);
    };

    const toggleRelationship = (index: number) => {
        const newFields : IConfiguredField[] = currentFields.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    relationship : item.relationship === 'AND' ? 'OR' : 'AND'
                };
            }
            return item;
        });
        setCurrentFields(newFields);
    };

    return (
        <div className="relative mt-4 flex flex-col gap-4 rounded-xl bg-gray-100 p-6">
            <span>Event Based Trigger</span>
            <X
                className="absolute right-4 top-4 cursor-pointer text-gray-400"
                onClick={onClose}
            />
            <FieldSelector
                options={fieldOptions}
                onSelectField={handleAddField}
                triggerValue={selectedFilter?.label || savedData?.name || 'Add Field'}
            />
            {currentFields.length > 0 && (
                <span className="text-lg text-gray-800">Filters</span>
            )}
            <FilterFields
                fields={sortedFields}
                onFieldUpate={handleFieldUpdate}
                onFieldDelete={handleDeleteField}
                className="pl-6"
            />
            <div className="h-[1px] w-full bg-gray-400"></div>
            <div className="flex gap-2">
                {currentFields.map((field, index) => (
                    <div className="flex gap-2" key={index}>
                        <Badge className="w-fit px-2 py-1">tx.{field.label}</Badge>
                        <div className="flex items-center justify-center text-center">
                            {currentFields.length > 1 &&
                                index != currentFields.length - 1 && (
                                    <span
                                        className="w-8 cursor-pointer underline underline-offset-2 text-brand-Blue-200"
                                        onClick={() => toggleRelationship(index)}
                                    >
                                        {field.relationship || 'And'}
                                    </span>
                                )}
                        </div>
                    </div>
                ))}
            </div>
            <Button
                onClick={handleTriggerSave}
                className={currentFields.length === 0 ? '!hidden' : ''}
            >
                {isEditing ? 'Save Trigger' : 'Add Trigger'}
            </Button>
        </div>
    );
};

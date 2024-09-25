import { useState } from 'react';

import { cn } from '@app/components/lib/utils';
import { TabsContent } from '@app/components/molecules/Tabs';

import { EventFilterDropDown, EventTypeDropDown } from './EventDropDown';
import FilterCard from './Filter/FilterCard';
import { FilterForm } from './Filter/MainForm';
import { IFieldMetaData, eventTypes } from './data/EventTypes';

export interface IConfiguredField extends IFieldMetaData {
    value: string | number | null;
    operator?: string;
    index: number;
    relationship?: string;
}

export interface IConfiguredTrigger {
    name: string;
    values: IConfiguredField[];
    index: number;
}

interface IEditingState {
    index: number | null;
    isEditing: boolean;
}

const CustomEventTabContent = ({
    className
}: {
    className?: string;
    currentFunctionName?: string;
}) => {
    //main state to save data
    const [savedData, setSavedData] = useState<IConfiguredTrigger[]>([]);
    const [currentEventType, setCurrentEventType] = useState(eventTypes[0]);

    const [selectedFilter, setSelectedFilter] = useState<IFieldMetaData | null>(null);
    const [editingState, setEditingState] = useState<IEditingState>({
        index: null,
        isEditing: false
    });

    const changeEventType = (eventLabel: string) => {
        const selectedEvent = eventTypes.find(
            (item) => item.metaData.label === eventLabel
        );
        if (selectedEvent) setCurrentEventType(selectedEvent);
        setSelectedFilter(null);
    };

    const changeFilter = (filterLabel: string) => {
        const selected = currentEventType?.filters?.find(
            (filter) => filter.label === filterLabel
        );
        console.log(selected);
        setEditingState({ index: null, isEditing: false });
        if (selected) setSelectedFilter(selected);
    };

    // Trigger CRUD
    const saveTrigger = (data: IConfiguredField[]) => {
        console.log(data);
        const updateSavedData = (updatedItem: IConfiguredTrigger, index: number) => {
            const newData = [...savedData];
            newData[index] = updatedItem;
            setSavedData(newData);
        };

        if (editingState.index !== null) {
            const updatedItem = {
                ...savedData[editingState.index],
                values: data
            };
            updateSavedData(updatedItem, editingState.index);
            setEditingState({ index: null, isEditing: false });
        } else if (selectedFilter) {
            const newItem: IConfiguredTrigger = {
                index: savedData.length,
                name: selectedFilter.label,
                values: data
            };
            setSavedData([...savedData, newItem]);
            setSelectedFilter(null);
        }
    };

    const editTrigger = (index: number) => {
        const filter = savedData[index];
        setSelectedFilter({
            label: filter.name,
            type: 'string',
            fields: filter.values.map((item) => ({
                label: item.name,
                type: item.type,
                value: item.value,
                defaultValue: item.defaultValue,
                relationship: item.relationship
            }))
        });
        setEditingState({ index, isEditing: true });
    };

    const deleteTrigger = (index: number) => {
        const filteredData = savedData.filter((_, i) => i !== index);
        const newSavedData = filteredData.map((item, i) => ({
            ...item,
            index: i
        }));
        setSavedData(newSavedData);
    };

    const closeTrigger = () => {
        setSelectedFilter(null);
        setEditingState({ index: null, isEditing: false });
    };

    return (
        <TabsContent value="Event" className={cn('p-6', className)}>
            <div className="flex flex-col gap-4">
                {/* Event Type and Filter Selectors */}
                <div className="flex gap-4">
                    <EventTypeDropDown
                        currentEventType={currentEventType}
                        onEventTypeChange={changeEventType}
                    />
                    <EventFilterDropDown
                        currentEventType={currentEventType}
                        onFilterSelect={changeFilter}
                    />
                </div>

                {/* Render filter config form if filter is a new filter */}
                {selectedFilter && !editingState.isEditing && (
                    <FilterForm
                        selectedFilter={selectedFilter}
                        onClose={closeTrigger}
                        onSave={saveTrigger}
                    />
                )}

                {/* Rendering Saved configs */}
                {savedData.length > 0 && (
                    <>
                        <div className="mt-4 h-[1px] w-full bg-brand-Gray-100 px-4"></div>
                        <div className="flex flex-col gap-4">
                            {savedData.map(
                                (configuredTrigger: IConfiguredTrigger, index) =>
                                    selectedFilter &&
                                    editingState.isEditing &&
                                    index === editingState.index ? (
                                        <FilterForm
                                            key={index}
                                            selectedFilter={selectedFilter}
                                            savedData={configuredTrigger}
                                            onClose={closeTrigger}
                                            onSave={saveTrigger}
                                            isEditing={editingState.isEditing}
                                        />
                                    ) : (
                                        <FilterCard
                                            key={index}
                                            configuredEvent={configuredTrigger}
                                            onDelete={() => deleteTrigger(index)}
                                            onEdit={() => editTrigger(index)}
                                        />
                                    )
                            )}
                        </div>
                    </>
                )}
            </div>
        </TabsContent>
    );
};

export default CustomEventTabContent;

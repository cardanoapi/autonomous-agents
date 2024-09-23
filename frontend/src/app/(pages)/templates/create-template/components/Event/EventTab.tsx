import { useState } from 'react';

import { Pencil, X } from 'lucide-react';

import { cn } from '@app/components/lib/utils';
import { TabsContent } from '@app/components/molecules/Tabs';

import { SelectEventFilter, SelectEventType } from './EventFilters';
import { IFieldMetaData, eventTypes } from './EventTypes';
import { eventLabelMap } from './EventTypes';
import { FilterConfiguration } from './FilterConfiuration';

export interface IConfiguredEventFilter {
    name: string;
    value: string | number | null;
    type: string;
    defaultValue: any;
}

export interface IConfiguredEvent {
    eventName: string;
    values: IConfiguredEventFilter[];
    index: number;
}

interface IEditingState {
    index: number | null;
    isEditing: boolean;
}

const CustomEventTabContent = ({
    className,
    currentFunctionName
}: {
    className?: string;
    currentFunctionName?: string;
}) => {
    const [savedData, setSavedData] = useState<IConfiguredEvent[]>([]);
    const [currentEventType, setCurrentEventType] = useState(eventTypes[0]);
    const [selectedFilter, setSelectedFilter] = useState<IFieldMetaData | null>(null);

    const [editingState, setEditingState] = useState<IEditingState>({
        index: null,
        isEditing: false
    });

    // filter changes and event type changes
    const handleEventTypeChange = (eventLabel: string) => {
        const selectedEvent = eventTypes.find(
            (item) => item.metaData.label === eventLabel
        );
        if (selectedEvent) setCurrentEventType(selectedEvent);
    };

    const handleFilterSelect = (filterLabel: string) => {
        console.log('filterLabel', filterLabel);
        const selected = currentEventType?.filters?.find(
            (filter) => filter.label === filterLabel
        );
        if (selected) setSelectedFilter(selected);
    };

    // filter configs
    const closeFilter = () => setSelectedFilter(null);

    const handleEdit = (index: number) => {
        const filter = savedData[index];
        setSelectedFilter({
            label: filter.eventName,
            type: 'string',
            value: filter.eventName,
            fields: filter.values.map((item, inex) => ({
                label: item.name,
                type: 'string',
                value: item.value,
                defaultValue: item.defaultValue
            }))
        });
        setEditingState({ index, isEditing: true });
    };

    const saveFilter = (data: IConfiguredEventFilter[]) => {
        const updateSavedData = (updatedItem: IConfiguredEvent, index: number) => {
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
            const newItem: IConfiguredEvent = {
                index: savedData.length,
                eventName: selectedFilter.label,
                values: data
            };
            setSavedData([...savedData, newItem]);
            setSelectedFilter(null);
        }
    };

    const handleDelete = (index: number) => {
        const filteredData = savedData.filter((_, i) => i !== index);
        const newSavedData = filteredData.map((item, i) => ({
            ...item,
            index: i
        }));
        setSavedData(newSavedData);
    };

    return (
        <TabsContent value="Event" className={cn('p-6', className)}>
            <div className="flex flex-col gap-4">
                {/* Event Type and Filter Selectors */}
                <div className="flex gap-4">
                    <SelectEventType
                        currentEventType={currentEventType}
                        onEventTypeChange={handleEventTypeChange}
                    />
                    <SelectEventFilter
                        currentEventType={currentEventType}
                        onFilterSelect={handleFilterSelect}
                    />
                </div>

                {/* Filter Configuration */}
                {selectedFilter && (
                    <FilterConfiguration
                        selectedFilter={selectedFilter}
                        onClose={closeFilter}
                        onSave={saveFilter}
                    />
                )}

                {/* Rendering Saved configs */}
                {savedData.length > 0 && (
                    <>
                        <div className="mt-4 h-[1px] w-full bg-brand-Gray-100 px-4"></div>
                        {renderSavedEvents(savedData, handleDelete, handleEdit)}
                    </>
                )}
            </div>
        </TabsContent>
    );
};

export default CustomEventTabContent;

const renderSavedEvents = (
    configuredEvents: IConfiguredEvent[],
    onDelete: (index: number) => void,
    onEdit: any
) => {
    return (
        <div className="flex flex-col gap-4">
            {configuredEvents.map((configuredEvent, index) => (
                <div
                    className="flex h-12 w-full items-center justify-between rounded-lg bg-gray-200 px-4"
                    key={index}
                >
                    <span key={configuredEvent.eventName} className="h3 inline-flex">
                        {eventLabelMap.get(configuredEvent.eventName) ||
                            configuredEvent.eventName}
                    </span>
                    <div className="flex items-center gap-2">
                        <Pencil
                            className="cursor-pointer text-gray-400"
                            onClick={() => onEdit(configuredEvent.index)}
                        />
                        <X
                            className="cursor-pointer text-gray-400"
                            onClick={() => onDelete(configuredEvent.index)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

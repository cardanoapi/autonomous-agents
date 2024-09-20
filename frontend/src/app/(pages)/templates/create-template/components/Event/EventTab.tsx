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
}

export interface IConfiguredEvent {
    eventName: string;
    values: IConfiguredEventFilter[];
    index: number;
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

    // filter changes and event type changes
    const handleEventTypeChange = (eventLabel: string) => {
        const selectedEvent = eventTypes.find(
            (item) => item.metaData.value === eventLabel
        );
        if (selectedEvent) setCurrentEventType(selectedEvent);
    };

    const handleFilterSelect = (filterLabel: string) => {
        const selected = currentEventType?.filters?.find(
            (filter) => filter.label === filterLabel
        );
        if (selected) setSelectedFilter(selected);
    };

    // filter configs
    const closeFilter = () => setSelectedFilter(null);

    const saveFilter = (data: IConfiguredEventFilter[]) => {
        if (selectedFilter) {
            const newData: IConfiguredEvent = {
                index: savedData.length,
                eventName: selectedFilter.label,
                values: data
            };
            const newSavedData = [...savedData, newData];
            setSavedData(newSavedData);
            console.log(newSavedData);
        }
        setSelectedFilter(null);
        console.log(savedData);
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
                        {renderSavedEvents(savedData, handleDelete)}
                    </>
                )}
            </div>
        </TabsContent>
    );
};

export default CustomEventTabContent;

const renderSavedEvents = (
    configuredEvents: IConfiguredEvent[],
    onDelete: (index: number) => void
) => {
    return (
        <div className="flex flex-col gap-4">
            {configuredEvents.map((configuredEvent) => (
                <div className="flex h-12 w-full items-center justify-between rounded-lg bg-gray-200 px-4">
                    <span key={configuredEvent.eventName} className="h3 inline-flex">
                        {eventLabelMap.get(configuredEvent.eventName) ||
                            configuredEvent.eventName}
                    </span>
                    <div className="flex items-center gap-2">
                        <Pencil className="cursor-pointer text-gray-100" />
                        <X
                            className="cursor-pointer text-gray-100"
                            onClick={() => onDelete(configuredEvent.index)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

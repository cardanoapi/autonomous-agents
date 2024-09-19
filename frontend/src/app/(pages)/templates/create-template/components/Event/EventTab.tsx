import { useEffect, useState } from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@app/components/atoms/Select';
import { cn } from '@app/components/lib/utils';
import { NumberInput } from '@app/components/molecules/NumberInput';
import { TabsContent } from '@app/components/molecules/Tabs';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

import { IFieldMetaData, eventTypes } from './EventTriggerFields';

const CustomEventTabContent = ({
    className,
    currentFunctionName
}: {
    className?: string;
    currentFunctionName?: string;
}) => {
    const [savedEvents, setSavedEvents] = useState([]);
    const [EventType, setEventType] = useState(eventTypes[0]);
    const [selectedFilter, setSelectedFilter] = useState<IFieldMetaData | null>(null);

    const onEventTypeChange = (eventLabel: string) => {
        const selectedEvent = eventTypes.find(
            (item) => item.metaData.value === eventLabel
        );
        selectedEvent && setEventType(selectedEvent);
    };

    const onFilterSelect = (filterLabel: string) => {
        const selectedFilter = EventType?.filters?.find(
            (item) => item.label === filterLabel
        );
        selectedFilter && setSelectedFilter(selectedFilter);
    };

    const renderEventTypesField = () => {
        return (
            <Select onValueChange={(value: string) => onEventTypeChange(value)}>
                <SelectTrigger>
                    <SelectValue placeholder={EventType.metaData.label} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    {eventTypes.map((item) => (
                        <SelectItem
                            key={item.metaData.value}
                            value={item.metaData.value}
                        >
                            {item.metaData.label}{' '}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    };

    const renderEventFiltersField = () => {
        return (
            <Select onValueChange={(value: string) => onFilterSelect(value)}>
                <SelectTrigger useAddIcon={true}>
                    <SelectValue placeholder="Add filter">Add filter</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white">
                    {(EventType?.filters || []).map((item) => (
                        <SelectItem key={item.label} value={item.label}>
                            {item.label}{' '}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    };

    const renderFilterForm = () => {
        return null;
    };

    return (
        <TabsContent value="Event" className={cn('p-6', className)}>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <div className="flex w-full flex-col gap-3">
                        <span className="h4">Event Type</span>
                        {renderEventTypesField()}
                    </div>
                    <div className="flex w-full flex-col gap-3">
                        <span className="h4">Event Filter</span>
                        {renderEventFiltersField()}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <span className="h4">Filters</span>
                    <Skeleton className="ml-4 h-32 w-72"></Skeleton>
                </div>
                <div className="mt-4 h-[1px] w-full bg-brand-Gray-100 px-4"></div>
                <div className="flex items-center justify-center gap-4">
                    <span className="inline-block">{currentFunctionName}</span>
                    <Skeleton className="h-8 w-32" />
                    <NumberInput defaultValue={3} className="pl-2" />
                </div>
            </div>
        </TabsContent>
    );
};

export default CustomEventTabContent;

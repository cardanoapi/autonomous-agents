import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@app/components/atoms/Select';

import { IEventType, eventTypes } from './EventTypes';

export const SelectEventType = ({
    currentEventType,
    onEventTypeChange
}: {
    currentEventType: IEventType;
    onEventTypeChange: (value: string) => void;
}) => (
    <div className="flex w-full flex-col gap-3">
        <span className="h4">Event Type</span>
        <Select onValueChange={onEventTypeChange}>
            <SelectTrigger>
                <SelectValue placeholder={currentEventType.metaData.label} />
            </SelectTrigger>
            <SelectContent className="bg-white">
                {eventTypes.map((item) => (
                    <SelectItem key={item.metaData.value} value={item.metaData.value}>
                        {item.metaData.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

export const SelectEventFilter = ({
    currentEventType,
    onFilterSelect
}: {
    currentEventType: IEventType;
    onFilterSelect: (value: string) => void;
}) => (
    <div className="flex w-full flex-col gap-3">
        <span className="h4">Event Filter</span>
        <Select onValueChange={onFilterSelect}>
            <SelectTrigger useAddIcon={true}>
                <SelectValue placeholder="Add filter">Add filter</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
                {(currentEventType?.filters || []).map((item) => (
                    <SelectItem
                        key={item.label}
                        value={item.label}
                        disabled={!item.fields?.length}
                    >
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
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
            <SelectTrigger className="w-full">
                {currentEventType.metaData.label}
            </SelectTrigger>
            <SelectContent className="bg-white">
                {eventTypes.map((item) => (
                    <SelectItem key={item.metaData.label} value={item.metaData.label}>
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
        <DropdownMenu>
            <DropdownMenuTrigger
                className="w-full items-center justify-between rounded-lg border-[1px] px-3 py-2 text-base"
                useAddIcon={true}
            >
                Add filter
            </DropdownMenuTrigger>
            <DropdownMenuContent className="!m-0 w-full">
                {(currentEventType?.filters || []).map((item) => (
                    <DropdownMenuItem
                        key={item.label}
                        onClick={() => onFilterSelect(item.label)}
                        disabled={!item.fields?.length}
                        className="m-0 w-full"
                    >
                        {item.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);

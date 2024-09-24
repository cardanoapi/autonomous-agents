import { Pencil, Trash } from 'lucide-react';

import { cn } from '@app/components/lib/utils';

import { IConfiguredTrigger } from '../EventMainTab';
import { eventLabelMap } from '../data/EventTypes';

export interface FilterCardProps {
    configuredEvent: IConfiguredTrigger;
    onDelete: (index: number) => void;
    onEdit: (index: number) => void;
}

export default function FilterCard({
    configuredEvent,
    onDelete,
    onEdit
}: FilterCardProps) {
    return (
        <div className="flex flex-col gap-4">
            <div
                className={cn(
                    'flex h-12 w-full items-center justify-between rounded-lg bg-gray-200 px-4'
                )}
            >
                <span key={configuredEvent.name} className="h3 inline-flex">
                    {eventLabelMap.get(configuredEvent.name) || configuredEvent.name}
                </span>
                <div className="flex items-center gap-2">
                    <Pencil
                        className="cursor-pointer text-gray-400"
                        onClick={() => onEdit(configuredEvent.index)}
                    />
                    <Trash
                        className="cursor-pointer text-gray-400"
                        onClick={() => onDelete(configuredEvent.index)}
                    />
                </div>
            </div>
        </div>
    );
}

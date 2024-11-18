import { useState } from 'react';

import { IBooleanNode, IEventTrigger, IFieldNode } from '@api/agents';
import { ChevronDown } from 'lucide-react';
import { FileJson, Parentheses } from 'lucide-react';

import { Card } from '@app/components/atoms/Card';
import { Checkbox } from '@app/components/atoms/Checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { Input } from '@app/components/atoms/Input';
import { cn } from '@app/components/lib/utils';

import { CustomSelect } from '../../../../../../components/molecules/CustomDropDown';
import InfoCard from '../cards/InfoCard';
import { Events, IEvent, IEventFilter } from './EventTrigger';
import NodeGraph from './EventTriggerGraph';

const EventTab = ({ className }: { className?: string }) => {
    const [currentEvent, setCurrentEvent] = useState<IEvent | null>(null);

    const [currentEventFilter, setCurrentEventFilter] = useState<IEventFilter | null>(
        null
    );

    const [isInfoVisible, setIsInfoVisible] = useState(false);

    const [formData, setFormData] = useState<IEventTrigger | null>(null);

    const [formMode, setFormMode] = useState<string>('normal');

    const handleSelectEvent = (eventId: string) => {
        const selectedEvent = Events.find((event) => event.id === eventId);
        if (selectedEvent) {
            setCurrentEvent(selectedEvent);
            setFormData({
                id: selectedEvent?.id,
                parameters: [],
                negate: false,
                operator: 'AND'
            });
        }
    };

    const handleSelectEventFilter = (eventFilterId: string) => {
        const selectedEventFilter = currentEvent?.filters.find(
            (filter) => filter.id === eventFilterId
        );
        if (selectedEventFilter) {
            setCurrentEventFilter(selectedEventFilter);
            return selectedEventFilter;
        }
    };

    const handleAddEventFilter = (eventFilterId: string) => {
        const selectedEventFilter = handleSelectEventFilter(eventFilterId);
        if (selectedEventFilter) {
            formData &&
                setFormData({
                    ...formData,
                    parameters: [
                        ...formData.parameters,
                        {
                            id: selectedEventFilter.id,
                            operator: 'AND',
                            negate: false,
                            children: []
                        }
                    ]
                });
        }
    };

    const handleAddParameter = (parameterId: string) => {
        if (formData && currentEventFilter) {
            const selectedParameter = Events.find((event) => event.id === formData.id)
                ?.filters.find((filter) => filter.id === currentEventFilter?.id)
                ?.parameters.find((param) => param.id === parameterId);
            if (selectedParameter) {
                const data = {
                    ...formData,
                    parameters: formData.parameters.map((eventFilter) =>
                        eventFilter.id === currentEventFilter?.id
                            ? {
                                  ...eventFilter,
                                  children: [
                                      //@ts-ignore
                                      ...(eventFilter.children || []),
                                      {
                                          id: selectedParameter.id,
                                          operator: 'equals',
                                          value: '',
                                          negate: false
                                      }
                                  ]
                              }
                            : eventFilter
                    )
                };
                setFormData(data);
            }
        }
    };

    const handleParamValueChange = (parameterId: string, value: any) => {
        if (formData && currentEventFilter) {
            const data = {
                ...formData,
                parameters: formData.parameters.map((eventFilter) =>
                    eventFilter.id === currentEventFilter?.id
                        ? {
                              ...eventFilter,
                              //@ts-ignore
                              children: eventFilter.children.map((child) =>
                                  child.id === parameterId ? { ...child, value } : child
                              )
                          }
                        : eventFilter
                )
            };
            setFormData(data);
        }
    };

    const handleParamOperatorChange = (parameterId: string, operator: string) => {
        if (formData && currentEventFilter) {
            const data = {
                ...formData,
                parameters: formData.parameters.map((eventFilter) =>
                    eventFilter.id === currentEventFilter?.id
                        ? {
                              ...eventFilter,
                              //@ts-ignore
                              children: eventFilter.children.map((child) =>
                                  child.id === parameterId
                                      ? { ...child, operator: operator }
                                      : child
                              )
                          }
                        : eventFilter
                )
            };
            setFormData(data);
        }
    };

    const handleParaNegationChange = (parameterId: string, negate: boolean) => {
        if (formData && currentEventFilter) {
            const data = {
                ...formData,
                parameters: formData.parameters.map((eventFilter) =>
                    eventFilter.id === currentEventFilter?.id
                        ? {
                              ...eventFilter,
                              //@ts-ignore
                              children: eventFilter.children.map((child) =>
                                  child.id === parameterId
                                      ? { ...child, negate: negate }
                                      : child
                              )
                          }
                        : eventFilter
                )
            };
            setFormData(data);
            console.log(formData);
        }
    };

    const getNotSelectedEventFilters = () => {
        return Events.find((event) => event.id === formData?.id)?.filters.filter(
            (filter) => !formData?.parameters.find((param) => param.id === filter.id)
        );
    };

    const getNotSelectedEventFilterParameters = () => {
        return currentEventFilter?.parameters.filter(
            (param) =>
                !formData?.parameters
                    .find((eventFilter) => eventFilter.id === currentEventFilter?.id)
                    //@ts-ignore
                    ?.children.find((child: IFieldNode) => child.id === param.id)
        );
    };

    return (
        <div className={cn('flex w-full flex-col gap-4 rounded-lg p-4', className)}>
            <div className="absolute right-8 flex gap-2 rounded-md bg-gray-200 p-2">
                <Parentheses
                    className={cn(
                        'cursor-pointer',
                        formMode === 'normal' && 'text-brand-Blue-200'
                    )}
                    onClick={() => setFormMode('normal')}
                />
                <FileJson
                    className={cn(
                        'cursor-pointer',
                        formMode === 'json' && 'text-brand-Blue-200'
                    )}
                    onClick={() => setFormMode('json')}
                />
            </div>
            <div className="flex gap-2">
                <CustomSelect
                    plusIcon={false}
                    className="w-64"
                    options={Events.map((item) => ({
                        label: item.label,
                        value: item.id
                    }))}
                    defaultValue={currentEvent?.label || 'Event'}
                    label="Event"
                    onSelect={handleSelectEvent}
                    disabled={currentEvent !== null}
                />
                <CustomSelect
                    plusIcon={true}
                    className="w-64"
                    options={
                        getNotSelectedEventFilters()?.map((item) => ({
                            label: item.label,
                            value: item.id
                        })) || []
                    }
                    defaultValue={
                        `${currentEvent?.label} filters` || 'Add Event Filter'
                    }
                    label="Event Filter"
                    onSelect={handleAddEventFilter}
                    disabled={currentEvent === null}
                />
                <InfoCard
                    onMouseEnter={() => {
                        setIsInfoVisible(true);
                    }}
                    onMouseLeave={() => {
                        setIsInfoVisible(false);
                    }}
                    visible={isInfoVisible}
                />
            </div>
            <div className="h-[600px] w-full items-center scroll-auto">
                {formData && formMode === 'normal' && <NodeGraph data={formData} />}
                {formData && formMode === 'json' && (
                    <div className="h-full overflow-y-auto bg-neutral-100 p-12">
                        <pre>
                            <code>{JSON.stringify(formData, null, 2)}</code>
                        </pre>
                    </div>
                )}
            </div>
            {currentEventFilter && (
                <Card className="min-h-[200px] bg-gray-200">
                    <div className="mb-8 flex items-end justify-between">
                        <nav className="flex gap-4">
                            {formData &&
                                formData?.parameters.map((param, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'cursor-pointer font-semibold',
                                            currentEventFilter.id === param.id &&
                                                'text-brand-Blue-200 underline underline-offset-4'
                                        )}
                                        onClick={() =>
                                            handleSelectEventFilter(param.id as string)
                                        }
                                    >
                                        {param.id}
                                    </div>
                                ))}
                        </nav>
                        <CustomSelect
                            className="w-64"
                            options={
                                getNotSelectedEventFilterParameters()?.map((item) => ({
                                    label: item.label,
                                    value: item.id
                                })) || []
                            }
                            defaultValue={` Add Parameters`}
                            onSelect={handleAddParameter}
                        />
                    </div>
                    {formData?.parameters.map((param, index) => {
                        if (param.id === currentEventFilter?.id) {
                            return (
                                <div key={index}>
                                    {(param as IBooleanNode).children?.map(
                                        (child, childIndex) => (
                                            <div
                                                key={childIndex}
                                                className="flex w-[75%] flex-col gap-4"
                                            >
                                                {
                                                    <RenderEventChildForm
                                                        eventFilterParam={
                                                            child as IFieldNode
                                                        }
                                                        onValueChange={(value) => {
                                                            handleParamValueChange(
                                                                child.id as string,
                                                                value
                                                            );
                                                        }}
                                                        onOperatorChange={(value) => {
                                                            handleParamOperatorChange(
                                                                child.id as string,
                                                                value
                                                            );
                                                        }}
                                                        onNegateChange={(value) => {
                                                            handleParaNegationChange(
                                                                child.id as string,
                                                                value
                                                            );
                                                        }}
                                                    />
                                                }
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        }
                    })}
                </Card>
            )}
        </div>
    );
};

const RenderEventChildForm = ({
    eventFilterParam,
    onValueChange,
    onOperatorChange,
    onNegateChange
}: {
    eventFilterParam: IFieldNode;
    onValueChange?: (value: any) => void;
    onOperatorChange?: (value: any) => void;
    onNegateChange?: (value: boolean) => void;
}) => {
    const [localOperator, setLocalOperator] = useState<string>(
        eventFilterParam.operator
    );

    const operators = ['equals', 'greaterThan', 'lessThan', 'in'];

    const handleOperatorChange = (operator: string) => {
        setLocalOperator(operator);
        onOperatorChange?.(operator);
    };

    return (
        <div className="mb-2 flex items-center gap-4">
            <span className="mt-2 min-w-32">{eventFilterParam.id}</span>
            <div className="flex items-center gap-2">
                <span className="mt-2">negate</span>
                <Checkbox
                    className="mt-2"
                    onCheckedChange={onNegateChange}
                    checked={eventFilterParam.negate}
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger
                    disableIcon={true}
                    className="mt-2 min-w-32 rounded border-none !p-0"
                >
                    <span className="flex w-full justify-between">
                        {localOperator}
                        <ChevronDown size={24} />
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="!z-[9999]">
                    {operators.map((operator, index) => (
                        <DropdownMenuItem
                            key={index}
                            className="!z-[9999] m-0 w-full"
                            onClick={() => handleOperatorChange(operator)}
                        >
                            {operator}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <Input
                className="w-full rounded-none border-b-2 border-l-0 border-r-0 border-t-0 border-black bg-transparent focus:outline-none focus:ring-0"
                defaultValue={eventFilterParam.value}
                onChange={(e) => onValueChange?.(e.target.value)}
            />
        </div>
    );
};

export default EventTab;

import React, { useEffect, useState } from 'react';

import { IBooleanNode, IEventTrigger, IFieldNode } from '@api/agents';
import { Events as transactionSchema } from 'libcardano/spec/properties';
import { ChevronDown, FileJson } from 'lucide-react';

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
import { CustomSelect } from '@app/components/molecules/CustomDropDown';
import { ErrorToast } from '@app/components/molecules/CustomToasts';
import { areArraysEqual } from '@app/utils/common/array';
import { Close } from '@app/views/atoms/Icons/Close';

import InfoCard from '../cards/InfoCard';
import CustomEditor from './CustomEditor';
import { ISchema } from './EventTrigger';
import NodeGraph from './EventTriggerGraph';

const EventTab = ({
    className,
    savedEventTrigger,
    onChange = () => {}
}: {
    className?: string;
    savedEventTrigger?: IEventTrigger;
    onChange?: (value: IEventTrigger) => void;
}) => {
    const [currentEvent, setCurrentEvent] = useState<ISchema | null>(null);

    const [currentEventFilter, setCurrentEventFilter] = useState<ISchema | null>(null);

    const [isInfoVisible, setIsInfoVisible] = useState(false);

    const [formData, setFormData] = useState<IEventTrigger | null>(
        savedEventTrigger || null
    );

    const [proMode, setProMode] = useState(false);

    useEffect(() => {
        if (formData) {
            onChange(formData);
        }
    }, [formData]);

    useEffect(() => {
        if (savedEventTrigger) {
            const savedEvent = transactionSchema.find(
                (event) => event.id === savedEventTrigger?.id
            );
            if (savedEvent) {
                setCurrentEvent(savedEvent);
            }
            const lastEventFilter = savedEvent?.properties?.find(
                (prop) =>
                    prop.id ===
                    savedEventTrigger?.children[savedEventTrigger?.children.length - 1]
                        ?.id
            );
            if (lastEventFilter) {
                setCurrentEventFilter(lastEventFilter);
            }
        }
    }, []);

    const handleSelectEvent = (eventId: string) => {
        const selectedEvent = transactionSchema.find((tx) => tx.id === eventId);
        if (selectedEvent) {
            setCurrentEvent(selectedEvent);
            setFormData({
                id: selectedEvent?.id,
                children: [],
                negate: false,
                operator: 'AND'
            });
        }
    };

    const handleSelectEventFilter = (eventFilterId: string) => {
        const selectedEventFilter = currentEvent?.properties?.find(
            (prop) => prop.id === eventFilterId
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
                    children: [
                        ...formData.children,
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

    function getSelectedParameter(parameterId: string | string[]) {
        const selectedProperty = transactionSchema
            .find((tx) => tx.id === formData!.id)
            ?.properties?.find((filter) => filter.id === currentEventFilter?.id);
        let selectedParameter: any = selectedProperty?.properties?.find((prop) => {
            if (Array.isArray(parameterId)) {
                return prop.id === parameterId[0];
            } else {
                return prop.id === parameterId;
            }
        });
        if (selectedParameter && 'properties' in selectedParameter) {
            selectedParameter = getNestedProperties(selectedParameter)?.find((prop) =>
                areArraysEqual(prop.id as string[], parameterId as string[])
            );
        }
        return selectedParameter;
    }

    const handleAddParameter = (parameterId: string) => {
        if (formData && currentEventFilter) {
            const selectedParameter = getSelectedParameter(parameterId);
            if (selectedParameter) {
                const data = {
                    ...formData,
                    children: formData.children.map((eventFilter) =>
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
                children: formData.children.map((eventFilter) =>
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
                children: formData.children.map((eventFilter) =>
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
                children: formData.children.map((eventFilter) =>
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
        }
    };

    const getNotSelectedEventFilters = () => {
        return transactionSchema
            .find((tx) => tx.id === formData?.id)
            ?.properties?.filter(
                (prop) => !formData?.children.find((child) => child.id === prop.id)
            );
    };

    function getNestedProperties(obj: ISchema) {
        const result: ISchema[] = [];
        const txObjectOperators = obj.operators;

        function recursiveFlatten(property: ISchema, parentId: any = []) {
            const { id, type, properties } = property;
            const newId: string[] = [...parentId, id];

            if (properties && Array.isArray(properties)) {
                properties.forEach((child) => recursiveFlatten(child, newId));
            } else {
                result.push({
                    id: newId,
                    label: newId.join('.'),
                    type,
                    operators: txObjectOperators
                });
            }
        }

        recursiveFlatten(obj);
        return result;
    }

    const getFlattenEventFilterParams = () => {
        return currentEventFilter?.properties
            ?.map((prop) => getNestedProperties(prop))
            .flat();
    };

    const getNotSelectedEventFilterParameters = () => {
        return (
            currentEventFilter &&
            getFlattenEventFilterParams()?.filter(
                (prop: ISchema) =>
                    !formData?.children
                        .find(
                            (eventFilter) => eventFilter.id === currentEventFilter?.id
                        )
                        //@ts-ignore
                        ?.children.find((child: IFieldNode) => child.id === prop.id)
            )
        );
    };

    const updateFormDataFromEditor = (data: any) => {
        try {
            const parsedData = JSON.parse(data);
            setFormData(parsedData);
        } catch (error) {
            ErrorToast('Invalid JSON');
        }
    };

    return (
        <div className={cn('flex w-full flex-col gap-4 rounded-lg p-4', className)}>
            <div className="absolute right-8 flex gap-2 rounded-md bg-gray-200 p-2">
                <FileJson
                    className={cn('cursor-pointer', proMode && 'text-brand-Blue-200')}
                    onClick={() => setProMode(!proMode)}
                />
            </div>
            <div className="flex gap-2">
                <CustomSelect
                    plusIcon={false}
                    className="w-64"
                    options={transactionSchema.map((txProp) => ({
                        label: txProp.label,
                        value: txProp.id
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
                    defaultValue={`${currentEvent?.label || 'Event'} filters`}
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
                <NodeGraph data={formData} />
            </div>
            <Card className="min-h-[200px] bg-gray-200">
                <div className="mb-8 flex items-end justify-between">
                    <nav className="flex gap-4">
                        {formData &&
                            formData?.children.map((child, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'cursor-pointer font-semibold',
                                        currentEventFilter &&
                                            currentEventFilter.id === child.id &&
                                            'text-brand-Blue-200 underline underline-offset-4'
                                    )}
                                    onClick={() =>
                                        handleSelectEventFilter(child.id as string)
                                    }
                                >
                                    {child.id}
                                </div>
                            ))}
                    </nav>
                    <CustomSelect
                        className="w-64"
                        options={
                            getNotSelectedEventFilterParameters()?.map(
                                (item: ISchema) => ({
                                    label: item.label,
                                    value: item.id
                                })
                            ) || []
                        }
                        disabled={currentEventFilter === null}
                        defaultValue={` Add Parameters`}
                        onSelect={handleAddParameter}
                    />
                </div>
                {currentEventFilter &&
                    formData?.children.map((param, index) => {
                        if (param.id === currentEventFilter?.id) {
                            return (
                                <div key={index}>
                                    {(param as IBooleanNode).children?.map(
                                        (child, childIndex) => (
                                            <div
                                                key={childIndex}
                                                className="flex w-full flex-col gap-4"
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
                                                        validator={
                                                            currentEventFilter.validator
                                                        }
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
            <div
                className={cn(
                    'transition-duration-300 fixed right-4 top-1/2 h-[80vh] w-[500px] -translate-y-1/2 transition-all ease-in-out',
                    !proMode && 'hidden'
                )}
            >
                <CustomEditor
                    defaultValue={formData}
                    onClose={() => setProMode(false)}
                    onValueChange={updateFormDataFromEditor}
                />
            </div>
        </div>
    );
};

const RenderEventChildForm = ({
    eventFilterParam,
    onValueChange,
    onOperatorChange,
    onNegateChange,
    validator
}: {
    eventFilterParam: IFieldNode;
    onValueChange?: (value: any) => void;
    onOperatorChange?: (value: any) => void;
    onNegateChange?: (value: boolean) => void;
    validator?: (...args: any) => any;
}) => {
    const [localOperator, setLocalOperator] = useState<string>(
        eventFilterParam.operator
    );

    const [errMsg, setErrMsg] = useState<string>('');

    useEffect(() => {
        const clearErrMsg = setTimeout(() => {
            setErrMsg('');
        }, 3000);
        return () => {
            clearTimeout(clearErrMsg);
        };
    }, [errMsg]);

    const operators = ['equals', 'greaterthan', 'lessthan', 'in'];

    const handleOperatorChange = (operator: string) => {
        setLocalOperator(operator);
        onOperatorChange?.(operator);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // if (validator && validator(e.target.value)) {
        //     onValueChange?.(e.target.value);
        // } else {
        //     setErrMsg('Kei Error occured');
        // }
        onValueChange?.(e.target.value);
    };
    return (
        <div className="group mb-2 flex items-center gap-4">
            <span className="mt-2 min-w-80 truncate">
                {Array.isArray(eventFilterParam.id)
                    ? (eventFilterParam.id as string[]).join('.')
                    : eventFilterParam.id}
            </span>
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
                onChange={handleInputChange}
            />
            {errMsg && <span className="text-red-500">{errMsg}</span>}
            <Close
                className={'invisible h-10 w-10 cursor-pointer group-hover:visible'}
            />
        </div>
    );
};

export default EventTab;

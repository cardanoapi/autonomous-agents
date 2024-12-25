import React, { useEffect, useState } from 'react';

import { IBooleanNode, IEventTrigger, IFieldNode } from '@api/agents';
import { getNestedTxProperties } from '@utils';
import { Events as transactionSchema } from 'libcardano/spec/properties';
import { ChevronDown } from 'lucide-react';

import NodeGraph from '@app/app/(pages)/templates/create-template/components/event/EventTriggerGraph';
import { Card } from '@app/components/atoms/Card';
import { Checkbox } from '@app/components/atoms/Checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import { Input } from '@app/components/atoms/Input';
import { Label } from '@app/components/atoms/label';
import { cn } from '@app/components/lib/utils';
import { CustomCombobox } from '@app/components/molecules/CustomCombobox';
import { CustomSelect } from '@app/components/molecules/CustomDropDown';
import { ErrorToast } from '@app/components/molecules/CustomToasts';
import { Switch } from '@app/components/shadcn/ui/switch';
import { areArraysEqual } from '@app/utils/common/array';
import { Close } from '@app/views/atoms/Icons/Close';

import InfoCard from '../cards/InfoCard';
import CustomEditor from './CustomEditor';
import { ISchema } from './EventTrigger';

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
            selectedParameter = getNestedTxProperties(selectedParameter)?.find((prop) =>
                areArraysEqual(prop.id as string[], parameterId as string[])
            );
        }
        return selectedParameter;
    }

    const handleAddParameter = (parameterId: string | string[]) => {
        console.log('Added param is : ', parameterId);
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
                                          operators: selectedParameter.operators
                                              ? selectedParameter.operators
                                              : ['eq'],
                                          validator: selectedParameter.validator,
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

    const handleDeleteParameter = (parameterId: string | string[]) => {
        if (!formData) return;
        const data = {
            ...formData,
            children: formData.children.map((eventFilter) => {
                return 'children' in eventFilter
                    ? {
                          ...eventFilter,
                          children: eventFilter.children.filter((child) => {
                              if (Array.isArray(child.id)) {
                                  return !areArraysEqual(
                                      child.id as string[],
                                      parameterId as string[]
                                  );
                              } else return child.id !== parameterId;
                          })
                      }
                    : eventFilter;
            })
        };
        setFormData(data);
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

    const getFlattenEventFilterParams = () => {
        return currentEventFilter?.properties
            ?.map((prop) => getNestedTxProperties(prop))
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
            <div className={'flex justify-between'}>
                <div className="flex items-center gap-2">
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
                    <div className={'flex flex-col gap-4'}>
                        <h1 className={'text-sm'}>Event Filter Parameters</h1>
                        <CustomCombobox
                            addSearchOption
                            disabled={currentEventFilter === null}
                            itemsList={
                                getNotSelectedEventFilterParameters()?.map(
                                    (item: ISchema) => item.label
                                ) || []
                            }
                            onSelect={(selectedParam: string) => {
                                const splittedParamArray = selectedParam.split('.');
                                handleAddParameter(splittedParamArray);
                            }}
                            defaultValue={'Search Parameter'}
                        />
                    </div>
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
                <div className="flex items-center space-x-2">
                    <Label htmlFor="airplane-mode">Editor Pro Mode</Label>
                    <Switch onClick={() => setProMode(!proMode)} id="airplane-mode" />
                </div>
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
                                                        onDeleteParameter={
                                                            handleDeleteParameter
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
            <div className="h-[600px] w-[1200px] items-center scroll-auto">
                {proMode ? (
                    <CustomEditor
                        defaultValue={formData}
                        onClose={() => setProMode(false)}
                        onValueChange={updateFormDataFromEditor}
                    />
                ) : (
                    <NodeGraph data={formData} />
                )}
            </div>
        </div>
    );
};

const RenderEventChildForm = ({
    eventFilterParam,
    onValueChange,
    onOperatorChange,
    onNegateChange,
    onDeleteParameter
}: {
    eventFilterParam: IFieldNode;
    onValueChange?: (value: any) => void;
    onOperatorChange?: (value: any) => void;
    onNegateChange?: (value: boolean) => void;
    onDeleteParameter?: (...args: any) => void;
}) => {
    const [localOperator, setLocalOperator] = useState<string>(
        eventFilterParam.operators[0]
    );

    useEffect(() => {
        localOperator && onOperatorChange?.(localOperator);
    }, [localOperator]);

    const [errMsg, setErrMsg] = useState<string>('');

    useEffect(() => {
        const clearErrMsg = setTimeout(() => {
            setErrMsg('');
        }, 3000);
        return () => {
            clearTimeout(clearErrMsg);
        };
    }, [errMsg]);

    const handleOperatorChange = (operator: string) => {
        setLocalOperator(operator);
        onOperatorChange?.(operator);
    };

    const handleOnDeleteParam = (paramId: string | string[]) => {
        onDeleteParameter && onDeleteParameter(paramId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!eventFilterParam?.validator(e.target.value)) {
            setErrMsg('Error occured');
        }
        onValueChange?.(e.target.value);
    };
    return (
        <div className={'flex flex-col gap-1'}>
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
                            {transformLabelForOperators(localOperator)}
                            <ChevronDown size={24} />
                        </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="!z-[9999]">
                        {eventFilterParam.operators.map((operator, index) => (
                            <DropdownMenuItem
                                key={index}
                                className="!z-[9999] m-0 w-full"
                                onClick={() => handleOperatorChange(operator)}
                            >
                                {transformLabelForOperators(operator)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Input
                    className="w-full rounded-none border-b-2 border-l-0 border-r-0 border-t-0 border-black bg-transparent focus:outline-none focus:ring-0"
                    defaultValue={eventFilterParam.value}
                    onChange={handleInputChange}
                />
                <Close
                    onClick={() => handleOnDeleteParam(eventFilterParam.id)}
                    className={
                        'invisible relative top-2 h-10 w-10 cursor-pointer group-hover:visible'
                    }
                />
            </div>
            {errMsg && (
                <div className="flex w-3/4 justify-end text-sm text-red-500">
                    {errMsg}
                </div>
            )}
        </div>
    );
};

function transformLabelForOperators(operator: string) {
    switch (operator) {
        case 'lt':
            return 'Less Than';
        case 'gt':
            return 'Greater Than';
        case 'gte':
            return 'Great Than Or Equals To';
        case 'lte':
            return 'Less Than Or Equals To';
        case 'eq':
            return 'Equals';
        default:
            return operator.toUpperCase();
    }
}

export default EventTab;

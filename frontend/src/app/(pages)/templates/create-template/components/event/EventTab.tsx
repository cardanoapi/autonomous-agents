import React, { useEffect, useMemo, useState } from 'react';

import { IBooleanNode, IEventTrigger, IFieldNode } from '@api/agents';
import { getNestedTxProperties } from '@utils';
import { Events as transactionSchema } from 'libcardano/spec/properties';

import EventTabRenderer from '@app/app/(pages)/templates/create-template/components/event/EventTabRenderer';
import RenderEventChildForm from '@app/app/(pages)/templates/create-template/components/event/RenderEventChildForm';
import { checkIfStringOrArrayOfStringIdsAreEqual } from '@app/app/(pages)/templates/create-template/components/utils/array';
import { Button } from '@app/components/atoms/Button';
import { Card } from '@app/components/atoms/Card';
import { Label } from '@app/components/atoms/label';
import { cn } from '@app/components/lib/utils';
import { CustomCombobox } from '@app/components/molecules/CustomCombobox';
import { CustomSelect } from '@app/components/molecules/CustomDropDown';
import { Switch } from '@app/components/shadcn/ui/switch';
import { areArraysEqual } from '@app/utils/common/array';

import InfoCard from '../cards/InfoCard';
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
            if (!selectedEventFilter.properties) {
                const { id, label, type, validator } = selectedEventFilter;
                selectedEventFilter.properties = [{ id, label, type, validator }];
            }
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

    const handleParamNegationChange = (parameterId: string, negate: boolean) => {
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
                        ?.children.find(
                            (child: IFieldNode) =>
                                !checkIfStringOrArrayOfStringIdsAreEqual(
                                    child.id,
                                    prop.id
                                )
                        )
            )
        );
    };

    const removeEventFilter = (filterId?: string | string[]) => {
        if (!filterId || !formData?.children) return;
        formData.children = formData?.children.filter(
            (child) =>
                child.id && checkIfStringOrArrayOfStringIdsAreEqual(filterId, child.id)
        );
        setFormData({ ...formData });
        formData &&
            formData.children &&
            formData.children.length ?
            handleSelectEventFilter(formData.children.slice(-1)[0].id as string):setCurrentEventFilter(null)
    };

    const memoizedEventFilterParams = useMemo(
        () =>
            getNotSelectedEventFilterParameters()?.map((item: ISchema) => {
                return { id: item.id, label: item.label };
            }) || [],
        [formData,handleSelectEventFilter]
    );

    const memoizedEventFilters = useMemo(
        () =>
            getNotSelectedEventFilters()?.map((item) => ({
                id: item.id,
                label: item.label
            })) || [],
        [formData]
    );

    return (
        <div className={cn('flex w-full flex-col gap-4 rounded-lg p-4', className)}>
            <div className="flex items-center space-x-2">
                <Label htmlFor="airplane-mode">Pro Mode</Label>
                <Switch onClick={() => setProMode(!proMode)} id="airplane-mode" />
            </div>
            {proMode ? (
                <></>
            ) : (
                <>
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
                        <div className={'flex flex-col gap-4'}>
                            <h1 className={'text-sm'}>Event Filter Parameters</h1>
                            <CustomCombobox
                                addSearchOption
                                disabled={currentEvent === null}
                                itemsList={memoizedEventFilters}
                                onSelect={(value: string) => {
                                    handleAddEventFilter(value);
                                }}
                                defaultValue={{ id: 'label', label: 'Event Filter' }}
                            />
                        </div>
                        <div className={'flex flex-col gap-4'}>
                            <h1 className={'text-sm'}>Event Filter Parameters</h1>
                            <CustomCombobox
                                addSearchOption
                                disabled={currentEventFilter === null}
                                itemsList={memoizedEventFilterParams}
                                onSelect={(value: string[]) => {
                                    // const splittedParamArray =
                                    //     dotSeperatedParamString.split('.');
                                    handleAddParameter(value);
                                }}
                                defaultValue={{
                                    id: 'label',
                                    label: 'Search Parameter'
                                }}
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
                                                    currentEventFilter.id ===
                                                        child.id &&
                                                    'text-brand-Blue-200 underline underline-offset-4'
                                            )}
                                            onClick={() =>
                                                handleSelectEventFilter(
                                                    child.id as string
                                                )
                                            }
                                        >
                                            {child.id}
                                        </div>
                                    ))}
                            </nav>
                            <Button
                                onClick={() =>
                                    removeEventFilter(currentEventFilter?.id)
                                }
                                className={'rounded px-2 py-1 !text-xs'}
                                size={'sm'}
                            >
                                Remove Event Filter
                            </Button>
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
                                                                onValueChange={(
                                                                    value
                                                                ) => {
                                                                    handleParamValueChange(
                                                                        child.id as string,
                                                                        value
                                                                    );
                                                                }}
                                                                onOperatorChange={(
                                                                    value
                                                                ) => {
                                                                    handleParamOperatorChange(
                                                                        child.id as string,
                                                                        value
                                                                    );
                                                                }}
                                                                onNegateChange={(
                                                                    value
                                                                ) => {
                                                                    handleParamNegationChange(
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
                </>
            )}
            {
                <EventTabRenderer
                    displayMonacoEditor={proMode}
                    formData={formData}
                    onEditorValueChange={(value) => setFormData(value)}
                />
            }
        </div>
    );
};

export default EventTab;

import React, { useEffect, useState } from 'react';

import { IParameter, ItemObject } from '@models/types/functions';
import { useAtom } from 'jotai';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useDebounceValue } from 'usehooks-ts';

import { Input } from '@app/components/atoms/Input';
import { errorAtom, selectedFunctionAtom } from '@app/store/atoms/formRenderer';

const ListParameter = ({ paramIndex, parameter }: { paramIndex: number; parameter: IParameter }) => {
    const [selectedFunction, setSelectedFunction] = useAtom(selectedFunctionAtom);
    const [errorIndex] = useAtom(errorAtom);
    const [items, setItems] = useState<Array<ItemObject>>(parameter.items || []);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        if (errorIndex.includes(paramIndex)) {
            setErrMsg('Please fill all required fields.');
        }
    }, [errorIndex]);

    useEffect(() => {
        if (errMsg) {
            const errorTimeout = setTimeout(() => setErrMsg(''), 3000);
            return () => clearTimeout(errorTimeout);
        }
    }, [errMsg]);

    useEffect(() => {
        const newItems =
            parameter.items?.map((item) => {
                return {
                    ...item,
                    parameters: item.parameters?.map((param) => ({
                        ...param,
                        value: ''
                    }))
                };
            }) || [];
        setItems([...newItems]);
    }, []);

    function checkIfFieldIsRequired() {
        if (!items) return true;
        const lastParamField = items[items.length - 1];
        return lastParamField && lastParamField.parameters?.length
            ? lastParamField.parameters.every((param) => param.value != '')
            : true;
    }
    const handleClickPlusIcon = () => {
        const newItem = getEmptyItem();
        if (newItem && newItem.parameters) {
            setItems([
                ...items,
                {
                    ...newItem,
                    parameters: newItem.parameters.map((param) => ({
                        ...param,
                        value: ''
                    }))
                }
            ]);
        }
    };

    function checkIfAnyFieldIsEmpty(items?: Array<ItemObject>) {
        let isEmpty;
        if (items && items.length) {
            const paramLength = items.length;
            items?.map((item, index) => {
                const isParamsFieldEmpty = item.parameters!.every((param) => param.value === '');
                if (isParamsFieldEmpty && paramLength > 1 && index != paramLength - 1) {
                    isEmpty = true;
                }
            });
        }
        return isEmpty;
    }

    const removeItem = (itemIndex: number) => {
        if (items?.length) {
            items.splice(itemIndex, 1);
            setItems([...items]);
        }
    };

    function getEmptyItem() {
        return parameter.items![0];
    }

    const handleOnChangeParams = (params: IParameter[], index: number) => {
        let updatedItems;
        if (items?.length && index < items?.length) {
            items[index] = { ...items[index], parameters: params };
            updatedItems = [...items];
        } else {
            updatedItems = [...items, { ...getEmptyItem(), parameters: params }];
        }
        const isEmpty = checkIfAnyFieldIsEmpty(updatedItems);
        if (isEmpty) {
            items && items.splice(index, 1);
        }
        if (selectedFunction && selectedFunction.parameters) {
            selectedFunction.parameters[paramIndex].items = [...items];
            setSelectedFunction({ ...selectedFunction });
        }
        setItems([...items]);
    };

    return (
        <div className={'flex flex-col gap-2'}>
            <div className={'flex flex-row gap-1'}>
                <span className={'text-md font-medium'}>{parameter.name} </span>
            </div>
            <div className={'flex flex-col gap-2'}>
                {items && items.length && (
                    <div className={'grid grid-cols-11 gap-4'}>
                        {items[0]?.parameters?.map((param) => {
                            return (
                                <div key={param.id} className={'col-span-5 flex flex-row gap-1'}>
                                    <span>{param.name}</span>
                                    {!parameter.optional && <span className={'text-red-500 '}>*</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
                {items &&
                    items.map((item, index) => {
                        return (
                            <div key={index} className={' relative grid grid-cols-11 gap-2'}>
                                {item.parameters && (
                                    <ItemsObjectParameter
                                        defaultValues={items.length ? items[index].parameters : []}
                                        handleOnChange={(params) => handleOnChangeParams(params, index)}
                                        parameters={item.parameters}
                                    />
                                )}
                                {items && items.length > 1 && (
                                    <div
                                        className={
                                            'absolute right-1 top-0 cursor-pointer rounded p-[1px] hover:bg-gray-200'
                                        }
                                        onClick={() => removeItem(index)}
                                    >
                                        <MinusIcon />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                {errMsg && <span className={'text-xs text-red-500'}>{errMsg} </span>}
                <div className={`flex justify-center `}>
                    <div
                        className={` w-fit rounded p-0.5 hover:bg-gray-200 ${checkIfFieldIsRequired() ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        onClick={checkIfFieldIsRequired() ? handleClickPlusIcon : () => {}}
                    >
                        <PlusIcon />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ItemsObjectParameter = ({
    parameters,
    handleOnChange,
    defaultValues
}: {
    parameters: IParameter[];
    handleOnChange?: (args: any) => void;
    defaultValues: any;
}) => {
    const [params, setParams] = useState<IParameter[]>(parameters);

    useEffect(() => {
        if (defaultValues && defaultValues.length) {
            setParams(defaultValues);
        }
    }, [defaultValues]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const updatedParam = params[index];
        updatedParam.value = e.target.value;
        setParams([...params]);
    };

    const [debouncedValue] = useDebounceValue(params, 300);

    function checkIfFieldIsRequired(parameter: IParameter) {
        const isAnyFieldFilled = params.some((param) => param.value !== '');
        if (isAnyFieldFilled) {
            return !parameter.value && !params.filter((param) => !param.optional).every((param) => param.value !== '');
        }
        return false;
    }

    useEffect(() => {
        if (debouncedValue) {
            handleOnChange && handleOnChange(debouncedValue);
        }
    }, [debouncedValue]);

    return (
        <>
            {params.map((param, index) => {
                return (
                    <div key={param.id} className={'col-span-5 flex flex-row gap-1'}>
                        <Input
                            placeholder={param.name}
                            name={param.id}
                            value={param.value}
                            onChange={(e) => handleInputChange(e, index)}
                            type={param.type === 'number' ? 'number' : 'text'}
                        />
                        {checkIfFieldIsRequired(param) && <span className={' text-red-500'}>*</span>}
                    </div>
                );
            })}
        </>
    );
};

export default ListParameter;

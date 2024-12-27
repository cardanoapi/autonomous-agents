import React, { useEffect, useState } from "react";



import { IFieldNode } from "@api/agents";
import { ChevronDown } from "lucide-react";



import { Checkbox } from "@app/components/atoms/Checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@app/components/atoms/DropDownMenu";
import { Input } from "@app/components/atoms/Input";
import { Close } from '@app/views/atoms/Icons/Close';

import { transformLabelForOperators } from '../utils/MapperHelper';


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

export default RenderEventChildForm
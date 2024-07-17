import { useState } from 'react';

import { IFunction, fetchFunctions } from '@api/functions';
import { useQuery } from '@tanstack/react-query';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../atoms/DropDownMenu';

export default function AgentFunctionsDropDown({ onChange }: { onChange?: any }) {
    const { data: agentFunctions = [] } = useQuery({
        queryKey: ['AgentFunctions'],
        queryFn: fetchFunctions
    });

    const [currentFunction, setCurrentFunction] = useState('None');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger border={true} className="flex w-72 justify-between">
                {currentFunction === 'None' ? 'Function' : currentFunction}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentFunction('None');
                        onChange?.('None');
                    }}
                >
                    All
                </DropdownMenuItem>
                {Object.values(agentFunctions)
                    ?.flat()
                    ?.map((agentFunction: IFunction, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={() => {
                                setCurrentFunction(agentFunction.function_name);
                                onChange?.(agentFunction.function_name);
                            }}
                        >
                            {agentFunction.name}
                        </DropdownMenuItem>
                    ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

'use client';

import * as React from 'react';
import { useState } from 'react';

import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import PolygonIcon from '../icons/Polygon';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className }, ref) => {
        const [value, setValue] = useState(1);

        function handleIncrement() {
            setValue((prevValue) => prevValue + 1);
        }

        function handleDecrement() {
            setValue((prevValue) => (prevValue > 1 ? prevValue - 1 : 1));
        }

        function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
            const inputValue = event.target.value;
            const newValue = parseInt(inputValue);

            if (!isNaN(newValue)) {
                setValue(newValue);
            }
        }

        return (
            <Card
                className={cn( 'flex h-[38px] w-[138px] flex-row items-center gap-y-0 border-[2px] p-0 text-[16px] focus-within:border-[#657B69]',(className))}
            >
                <Input
                    className="m-0 border-none p-0 text-center focus:outline-none active:border-none bg-transparent"
                    value={value}
                    onChange={handleChange}
                />
                <div className="pr-1 top-4 flex-col">
                    <div onClick={handleIncrement}>
                        <PolygonIcon className="rotate-180 h-full w-full" />
                    </div>
                    <div onClick={handleDecrement}>
                        <PolygonIcon  className='h-full w-full'/>
                    </div>
                </div>
            </Card>
        );
    }
);
NumberInput.displayName = 'Input';

export { NumberInput };

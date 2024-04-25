'use client';

import * as React from 'react';
import { useState } from 'react';

import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import PolygonIcon from '../icons/Polygon';
import { cn } from '../lib/utils';
import { over } from 'lodash';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
                <Input
                    className="'flex h-[38px] w-[138px] flex-row items-center gap-y-0 border-[2px]  text-[16px] focus-within:border-[#657B69] remove-arrow m-0  text-center focus:outline-none active:border-none"
                    type="number"
                    id="input01"
                    ref={ref}
                
                    {...props}
                />
        );
    }
);
NumberInput.displayName = 'Input';

export { NumberInput };

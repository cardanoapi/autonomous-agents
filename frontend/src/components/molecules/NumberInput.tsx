'use client';

import * as React from 'react';

import { Input } from '../atoms/Input';
// assuming cn is defined here
import { cn } from '../lib/utils';

// Correct import path

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    viewOnly?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, defaultValue, onChange, viewOnly, ...props }, ref) => {
        return (
            <Input
                className={cn('h-8 w-24 border-[1px] p-0 text-center focus:border-brand-Gray-100', className)}
                type="number"
                defaultValue={defaultValue}
                ref={ref}
                onChange={onChange}
                viewOnly={viewOnly}
                {...props}
            />
        );
    }
);

NumberInput.displayName = 'Input';

export { NumberInput };

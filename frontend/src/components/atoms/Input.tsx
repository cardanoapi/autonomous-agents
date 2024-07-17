import * as React from 'react';

import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'placeholder:text-brand-black-100 placeholder:text-muted-foreground focus:ring-black-400 focus-outline-primary flex h-8 w-full rounded-md border border-brand-border-400 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };

import * as React from 'react';

import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'placeholer:text-brand-black-100 r placeholder:text-muted-foreground border-brand-border-400 flex h-8 w-full rounded-md border px-3 py-2 pl-4 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:ring-black-400 disabled:cursor-not-allowed disabled:opacity-50 focus-outline-primary',
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

import * as React from 'react';

import { cn } from '../lib/utils';

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'border-input bg-background placeholder:text-muted-foreground active:border=[1px] focus-outline-primary flex min-h-[80px] w-full resize-none rounded-md border border-brand-border-100 px-3  py-2 text-sm focus:border-[1px] disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };

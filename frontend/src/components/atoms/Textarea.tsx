import * as React from 'react';

import { cn } from '../shadcn/lib/utils';

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    viewOnly?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, viewOnly = false, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'border-input placeholder:text-muted-foreground active:border=[1px] focus-outline-primary flex min-h-[80px] w-full resize-none rounded-md border border-brand-border-100 bg-background px-3  py-2 text-sm focus:border-[1px] disabled:cursor-not-allowed disabled:opacity-50',
                    viewOnly
                        ? 'pointer-events-none cursor-default bg-brand-White-200 focus:pointer-events-none active:border-0'
                        : '',
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

'use client';

import * as React from 'react';

import * as LabelPrimitive from '@radix-ui/react-label';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../shadcn/lib/utils';

const labelVariants = cva(
    'text-sm font-[500] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    {
        variants: {
            size: {
                small: 'text-[12px] leading-[18px]',
                medium: 'text-[14px] leading-[21px]',
                large: 'text-[24px] leading-[24px] font-[600]'
            }
        },
        defaultVariants: {
            size: 'medium'
        }
    }
);

const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
        VariantProps<typeof labelVariants>
>(({ className, size, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants({ size, className }))}
        {...props}
    />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

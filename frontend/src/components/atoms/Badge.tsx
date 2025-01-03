import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
    'flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none hover:cursor-pointer text-center !flex !items-center !justify-center',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-gray-500 text-white hover:bg-gray-500/80',
                primary: 'border-brand-border-200 border-[2px] text-xs font-medium text-gray-500',
                secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive: 'border-transparent bg-red-500 text-white hover:bg-red-500/80',
                outline: 'text-foreground',
                success: '' + 'border-transparent bg-green-500 text-white hover:bg-green-500/80',
                successPrimary: '' + 'border-transaprent bg-brand-Blue-200 text-white hover:bg-brand-Blue-100/80'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

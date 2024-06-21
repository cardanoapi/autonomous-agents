import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@app/components/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300',
    {
        variants: {
            variant: {
                default:
                    'bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
                primary:
                    'bg-brand-Blue-200 text-white hover:bg-brand-Blue-300 active:border-[0.5px] active:border-rounded',
                secondary: 'bg-brand-Black-100 text-white hover:bg-[#D9D9D9]',
                destructive:
                    'bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 active:border-[0.5px] dark:hover:bg-red-900/90',
                outline:
                    'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50',
                ghost: 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50',
                link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
                danger: 'bg-brand-Red-100 text-white hover:bg-brand-Red-200 ',
                cool: 'bg-none border-brand-Blue-200 text-brand-Blue-200 border-[1px] active without-ring hover:bg-brand-Blue-200 hover:text-white'
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-[32px] rounded-sm  px-2 text-[12px]',
                md: 'h-[36px] rounded-sm px-3 text-[14px]',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10'
            },
            border: {
                none: '',
                small: 'border-[2px] border-black',
                medium: 'border-[4px] border-black',
                large: 'border-[6px] border-black'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            border: 'none'
        }
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, border, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, border, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

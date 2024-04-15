import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';
import { buttonVariants } from './Button';
import { Search } from 'lucide-react';

const SearchFieldVariants = cva(
    'inline-flex rounded-[8px] w-[240px] h-[40px] text-[14px] gap-x-2 pl-2 leading-[21px] items-center placeholder:ext-[#AAAAAA]',
    {   
        variants: {
            variant: {
                primary : 'bg-[#F6F6F6] hover:shadow-md hover:shadow-sky-100 transisition duration-150 active:outline-[1px] active:shadow-md active:shadow-sky-200'
            },
        },
})

export interface SearchFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof SearchFieldVariants> {
    asChild?: boolean;
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'input';
        return (
            <div className={cn(SearchFieldVariants({ variant, className }))}>
                <Search size={16} />
                <Comp
                    className='bg-transparent outline-none'
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
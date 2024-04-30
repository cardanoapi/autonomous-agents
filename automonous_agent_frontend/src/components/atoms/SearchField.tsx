import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';
import { Search } from 'lucide-react';

const SearchFieldVariants = cva(
    'inline-flex rounded-[8px] text-[14px] gap-x-2 pl-2 leading-[21px] items-center placeholder:text-[#AAAAAA] py-2',
    {   
        variants: {
            variant: {
                primary : 'bg-[#F6F6F6] hover:shadow-md hover:shadow-sky-100 transisition duration-150 active:outline-[1px] active:shadow-md active:shadow-sky-200',
                secondary : 'bg-white rounded-[4px] hover:shadow-md hover:shadow-sky-100 transisition duration-150 active:outline-[1px] active:shadow-md active:shadow-sky-200 border-[1px] border-[#DBDBDB]'
            },
        },
        defaultVariants : {
            variant : 'primary'
        }
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
                <Search size={16}/>
                <Comp
                    className='bg-transparent outline-none w-[90%]'
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);

SearchField.displayName = 'SearchField'
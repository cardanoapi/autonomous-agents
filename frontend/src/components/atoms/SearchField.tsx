import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import { Search } from 'lucide-react';

import { cn } from '../lib/utils';

const SearchFieldVariants = cva(
    'inline-flex rounded-[8px] text-[14px] gap-x-2 pl-2 leading-[21px] items-center placeholder:text-brand-Gray-200 py-2',
    {
        variants: {
            variant: {
                primary:
                    'bg-[#F6F6F6] hover:shadow-md hover:shadow-sky-100 transisition duration-150 active:outline-[1px] active:shadow-md active:shadow-sky-200',
                secondary:
                    'bg-white rounded-[4px] hover:shadow-md hover:shadow-sky-100 transisition duration-150 active:outline-[1px] active:shadow-md active:shadow-sky-200 border-[1px] border-[#DBDBDB]'
            }
        },
        defaultVariants: {
            variant: 'primary'
        }
    }
);
export interface SearchFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof SearchFieldVariants> {
    asChild?: boolean;
    onSearch?: (value: string) => void;
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
    (
        { className, variant, size, onChange, onSearch, asChild = false, ...props },
        ref
    ) => {
        const Comp = asChild ? Slot : 'input';

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            onChange?.(e);
            onSearch?.(value);
        };

        return (
            <div className={cn(SearchFieldVariants({ variant, className }))}>
                <Search size={16} />
                <Comp
                    className="w-[90%] bg-transparent outline-none"
                    ref={ref}
                    {...props}
                    onChange={handleChange}
                />
            </div>
        );
    }
);

SearchField.displayName = 'SearchField';

import React, { ChangeEvent } from 'react';

import { debounce } from 'lodash';

import { SearchField } from '@app/components/atoms/SearchField';
import { cn } from '@app/components/lib/utils';

interface DataActionBarProps {
    onSearch?: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function DataActionBar({ onSearch, placeholder = 'Search', className }: DataActionBarProps) {
    const handleSearch = debounce((event: ChangeEvent<HTMLInputElement>) => {
        onSearch && onSearch(event.target.value);
    }, 500);

    return (
        <div className={cn(className, 'flex w-full')}>
            <SearchField
                variant="secondary"
                placeholder={placeholder}
                onChange={handleSearch}
                className={'h-10  w-full min-w-[50px] rounded-lg px-4 py-3 text-sm xl:w-[400px] 2xl:w-[500px]'}
            />
        </div>
    );
}

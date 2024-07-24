import React, { ChangeEvent } from 'react';

import { debounce } from 'lodash';

import { SearchField } from '@app/components/atoms/SearchField';

interface DataActionBarProps {
    onSearch?: (value: string) => void;
    placeholder?: string;
}

export default function DataActionBar({
    onSearch,
    placeholder = 'Search'
}: DataActionBarProps) {
    const handleSearch = debounce((event: ChangeEvent<HTMLInputElement>) => {
        onSearch && onSearch(event.target.value);
    }, 500);

    return (
        <div className="flex w-full justify-between">
            <SearchField
                variant="secondary"
                placeholder={placeholder}
                onChange={handleSearch}
                className="w-[500px] rounded-s px-4 py-3 text-sm"
            />
        </div>
    );
}

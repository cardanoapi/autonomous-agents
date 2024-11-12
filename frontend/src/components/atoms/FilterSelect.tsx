'use client';

import { SlidersHorizontal } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from './Select';

export interface ISelectItem {
    label: string;
    value: string;
}

export default function FilterSelect({
    options
}: {
    renderIcon?: boolean;
    className?: string;
    options?: ISelectItem[];
    value?: string;
}) {
    return (
        <Select>
            <SelectTrigger
                className="h4 flex w-full items-center gap-x-2"
                renderArrow={false}
            >
                <SlidersHorizontal className="max-h-[80%] bg-black" />
                <SelectValue placeholder="Newest" />
            </SelectTrigger>
            <SelectContent className="h4 bg-white">
                {options?.map((item, index) => (
                    <div key={index}>
                        <SelectItem value={item.value}>{item.label}</SelectItem>
                    </div>
                ))}
            </SelectContent>
        </Select>
    );
}

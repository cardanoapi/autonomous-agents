import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from '@app/components/atoms/Select';
import { cn } from '@app/components/lib/utils';

export const CustomDropDown = ({
    defaultValue,
    options,
    label,
    onSelect,
    chevronIcon = true,
    plusIcon = false,
    disabled = false
}: {
    defaultValue: string;
    label: string;
    options: string[];
    onSelect: (item: string) => void; // Specify the type for onSelect
    disabled?: boolean;
    chevronIcon?: boolean;
    plusIcon?: boolean;
}) => (
    <div className="flex w-full flex-col gap-3">
        <span className="h4">{label}</span>
        <DropdownMenu>
            <DropdownMenuTrigger
                useAddIcon={plusIcon}
                renderChevronIcon={chevronIcon}
                className="w-full items-center justify-between rounded-lg border-[1px] border-brand-border-200 px-4 py-2"
            >
                {defaultValue}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="z-[9999] w-full max-w-none bg-white"
                sideOffset={0}
            >
                {options.map((item) => (
                    <DropdownMenuItem
                        key={item}
                        onClick={() => onSelect(item)}
                        className="z-[9999] m-0 w-full"
                    >
                        {item}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);

interface ISelectItem {
    label: string;
    value: any;
}

export const CustomSelect = ({
    defaultValue,
    className,
    options,
    label,
    onSelect,
    plusIcon = false,
    disabled = false
}: {
    defaultValue: string;
    label?: string;
    className?: string;
    options: ISelectItem[];
    onSelect: (item: any) => void; 
    disabled?: boolean;
    plusIcon?: boolean;
}) => (
    <div className={cn("flex w-full flex-col gap-3" , className)}>
        {label && <span className="h4">{label}</span>}
        <Select defaultValue={defaultValue} onValueChange={(item) => onSelect(item)} disabled={disabled}>
            <SelectTrigger
                useAddIcon={plusIcon}
                className="w-full items-center justify-between rounded-lg border-[1px] border-brand-border-200 px-4 py-2"
            >
                {defaultValue}
            </SelectTrigger>
            <SelectContent className="z-[9999] w-full max-w-none bg-white">
                {options.map((item, index) => (
                    <SelectItem key={`${item.label}-${index}`} value={item.value}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

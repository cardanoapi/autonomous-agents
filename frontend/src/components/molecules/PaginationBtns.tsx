import React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../atoms/DropDownMenu';
import { cn } from '../lib/utils';

interface PaginationBtnsProps extends React.HTMLAttributes<HTMLDivElement> {
    lowerLimit?: number;
    refCurrentPage?: number;
    upperLimit: number;
    onPaginate?: any;
    rowsPerPage?: number;
    rowsLabel?: string;
    rowOptions?: number[];
    onRowClick?: any;
}

const chevronWrapper = 'border-brand-Gray-100 border-[1px] rounded-md px-[3px] py-[2px] hover:bg-gray-300';

const disableChevron = 'pointer-events-none bg-gray-200';

const PaginationBtns: React.FC<PaginationBtnsProps> = ({
    className,
    lowerLimit = 1,
    refCurrentPage = 1,
    upperLimit,
    onPaginate = () => {},
    rowsLabel,
    rowsPerPage,
    rowOptions = [10, 15, 20, 30],
    onRowClick,
    ...props
}) => {
    const currentPage = refCurrentPage;

    function handleLeftClick() {
        onPaginate(-1);
    }

    function handleRightClick() {
        onPaginate(+1);
    }

    return (
        <div className="flex items-center justify-center">
            <DropdownMenu>
                <span className="text-xs">{rowsLabel || 'Rows per page'} : </span>
                <DropdownMenuTrigger className="ml-1 inline-flex gap-x-1 p-0 text-xs" renderChevronIcon>
                    {rowsPerPage || 1}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-0">
                    {rowOptions.map((row: number) => (
                        <DropdownMenuItem key={row} onClick={() => onRowClick?.(row)}>
                            {row}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <div {...props} className={cn('ml-4 flex items-center gap-x-2', className)}>
                <div className={cn(chevronWrapper, currentPage === lowerLimit ? disableChevron : '')}>
                    <ChevronLeft
                        size={14}
                        stroke={lowerLimit === refCurrentPage ? '#868FA0' : '#464F60'}
                        onClick={handleLeftClick}
                    />
                </div>
                <span className="text-center text-xs ">
                    {refCurrentPage ? refCurrentPage : currentPage}
                    {upperLimit ? `/${upperLimit}` : ''}
                </span>
                <div className={cn(chevronWrapper, upperLimit === refCurrentPage ? disableChevron : '')}>
                    <ChevronRight
                        size={14}
                        stroke={upperLimit === refCurrentPage ? '#868FA0' : '#464F60'}
                        onClick={handleRightClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default PaginationBtns;

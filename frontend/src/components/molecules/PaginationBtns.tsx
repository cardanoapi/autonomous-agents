import React, { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '../lib/utils';

interface PaginationBtnsProps extends React.HTMLAttributes<HTMLDivElement> {
    lowerLimit?: number;
    upperLimit: number;
    onPaginate?: any;
}

const chevronWrapper =
    'border-brand-Gray-100 border-[1px] rounded-lg px-[3px] py-[2px] hover:bg-gray-300';

const disableChevron = 'pointer-events-none bg-gray-200';

const PaginationBtns: React.FC<PaginationBtnsProps> = ({
    className,
    lowerLimit = 1,
    upperLimit,
    onPaginate = () => {},
    ...props
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    function handleLeftClick() {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        onPaginate(newPage);
    }

    function handleRightClick() {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);
        onPaginate(newPage);
    }

    return (
        <div {...props} className={cn('flex items-center gap-x-1', className)}>
            <div
                className={cn(
                    chevronWrapper,
                    currentPage === lowerLimit ? disableChevron : ''
                )}
            >
                <ChevronLeft
                    size={18}
                    stroke={lowerLimit === currentPage ? '#868FA0' : '#464F60'}
                    onClick={handleLeftClick}
                />
            </div>
            <span className="w-6 text-center text-base">{currentPage}</span>
            <div
                className={cn(
                    chevronWrapper,
                    upperLimit === currentPage ? disableChevron : ''
                )}
            >
                <ChevronRight
                    size={18}
                    stroke={upperLimit === currentPage ? '#868FA0' : '#464F60'}
                    onClick={handleRightClick}
                />
            </div>
        </div>
    );
};

export default PaginationBtns;

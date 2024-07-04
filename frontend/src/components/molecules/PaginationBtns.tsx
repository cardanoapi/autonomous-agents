import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaginationBtnsProps extends React.HTMLAttributes<HTMLDivElement> {
    lowerLimit?: number;
    refCurrentPage?: number;
    upperLimit: number;
    onPaginate?: any;
}

const chevronWrapper =
    'border-brand-Gray-100 border-[1px] rounded-lg px-[3px] py-[2px] hover:bg-gray-300';

const disableChevron = 'pointer-events-none bg-gray-200';

const PaginationBtns: React.FC<PaginationBtnsProps> = ({
    className,
    lowerLimit = 1,
    refCurrentPage = 1,
    upperLimit,
    onPaginate = () => {},
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
        <div {...props} className={cn('flex items-center gap-x-2', className)}>
            <div
                className={cn(
                    chevronWrapper,
                    currentPage === refCurrentPage ? disableChevron : ''
                )}
            >
                <ChevronLeft
                    size={18}
                    stroke={lowerLimit === refCurrentPage ? '#868FA0' : '#464F60'}
                    onClick={handleLeftClick}
                />
            </div>
            <span className="text-center text-base ">
                {refCurrentPage ? refCurrentPage : currentPage}
                {upperLimit ? `/${upperLimit}` : ''}
            </span>
            <div
                className={cn(
                    chevronWrapper,
                    upperLimit === refCurrentPage ? disableChevron : ''
                )}
            >
                <ChevronRight
                    size={18}
                    stroke={upperLimit === refCurrentPage ? '#868FA0' : '#464F60'}
                    onClick={handleRightClick}
                />
            </div>
        </div>
    );
};

export default PaginationBtns;

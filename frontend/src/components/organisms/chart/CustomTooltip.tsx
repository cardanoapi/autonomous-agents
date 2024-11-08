import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { Card } from '@app/components/molecules/Card';

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
    className?: string;
    showOnlyTransaction?: boolean;
}

const CustomTooltip = ({
    active,
    payload,
    className,
    showOnlyTransaction = false
}: CustomTooltipProps) => {
    if (active) {
        if (showOnlyTransaction) {
            return (
                <Card
                    className={`rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] ${className} !gap-2 !p-2`}
                >
                    <div className="flex">
                        <span className="inline-flex items-center">
                            {payload?.[0]?.payload?.amt || '0'}
                            <span className="h2 ml-1 inline-flex !text-brand-Gray-100">
                                Transactions
                            </span>
                        </span>
                    </div>
                    <span className=" text-center text-xs">
                        {payload?.[0]?.payload?.name}
                    </span>
                </Card>
            );
        }
        return (
            <Card
                className={`min-w-32 items-center rounded-xl pb-4 pt-4 text-center shadow-[0_3px_10px_rgb(0,0,0,0.2)] ${className}`}
            >
                <div className="h1">
                    {payload?.[0]?.payload?.amt || '0'}{' '}
                    <span className="h2 !text-brand-Gray-100">Transactions</span>
                </div>
                <div className="h4">{payload?.[0]?.payload?.name}</div>
                {payload?.[0]?.payload?.toolTipFooter && (
                    <div>{payload[0].payload.toolTipFooter}</div>
                )}
            </Card>
        );
    }

    return null;
};

export default CustomTooltip;

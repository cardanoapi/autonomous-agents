import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { Card } from '@app/components/atoms/Card';

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active) {
        return (
            <Card className="min-w-32 items-center rounded-xl pb-4 pt-4 text-center shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
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
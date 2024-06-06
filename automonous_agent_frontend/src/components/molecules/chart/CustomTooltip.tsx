import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { Card } from '@app/components/atoms/Card';

const CustomTooltip = ({
    active,
    payload,
    label
}: TooltipProps<ValueType, NameType>) => {
    if (active) {
        return (
            <Card className="rounded-xl min-w-32 items-center text-center pt-4 pb-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                <div className='h1'>{payload?.[0]?.payload?.amt || 'NA'} <span className='h2 !text-brand-Gray-100'>Transaction</span></div>
                <div className='h4'>{payload?.[0]?.payload?.name}</div>
            </Card>
        );
    }

    return null;
};

export default CustomTooltip;

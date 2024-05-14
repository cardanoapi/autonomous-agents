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
            <Card className="rounded-xl min-w-32 items-center text-center pt-4 pb-4 shadow-[0_3px_10px_rgb(0,0,0,0.1)]">
                <div className='h4'>Last {label} hours</div>
                <div className='h1'>{payload?.[0].value} <span className='h2 !text-brand-Gray-100'>Transfers</span></div>
            </Card>
        );
    }

    return null;
};

export default CustomTooltip;

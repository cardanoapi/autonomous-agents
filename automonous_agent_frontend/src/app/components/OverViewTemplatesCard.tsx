import { FileText } from 'lucide-react';
import { FileCog } from 'lucide-react';

import { Card } from '@app/components/atoms/Card';

import OverViewCardTitle from './OverViewCardTitle';

export interface IOverViewTemplatesCard {
    title: string;
    totalTemplates: number;
    defaultTemplates: number;
    customTemplates: number;
}

export default function OverViewTemplatesCard({
    title,
    totalTemplates,
    defaultTemplates,
    customTemplates
}: IOverViewTemplatesCard) {
    return (
        <Card className="flex h-full w-full flex-col justify-between gap-y-0 p-4 pb-6 min-w-[264px] hover-transition-primary">
            <OverViewCardTitle title={title} value={totalTemplates} />
            <div className="flex w-full gap-x-12 items-center 4xl:gap-x-12">
                <div className="flex items-center gap-x-2">
                    <FileText stroke='#1C63E7'/>
                    <div className="card-h4 ">{defaultTemplates}</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <FileCog stroke='#1C63E7'/>
                    <div className="card-h4"><span className='#ff3100'></span>{customTemplates}</div>
                </div>
            </div>
        </Card>
    );
}

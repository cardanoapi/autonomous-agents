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
        <Card className="flex h-full w-full flex-col justify-between gap-y-0 p-4">
            <OverViewCardTitle title={title} value={totalTemplates} />
            <div className="flex w-full items-center gap-x-[20%] card-mt-1">
                    <div className="flex items-center">
                        <FileText fill="#2196F3" stroke="#fff" height={24} width={24}/>
                        <div className="h3">{defaultTemplates}</div>
                    </div>
                    <div className='flex items-center'>
                        <FileCog fill='#2196F3' stroke='#fff' height={24} width={24}/>
                        <div className="h3">{customTemplates}</div>
                    </div>
            </div>
        </Card>
    );
}

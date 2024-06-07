import { FileText } from 'lucide-react';
import { FileCog } from 'lucide-react';

import { Card } from '@app/components/atoms/Card';

import OverViewCard from './OverViewCard';
import TemplateIcon from '@app/components/icons/TemplatesIcon';
import { TemplateEditIcon } from '@app/components/icons/TemplateEditIcon';

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
        <OverViewCard title={title} value={totalTemplates}>
            <div className="flex w-full gap-x-14 items-center">
                <div className="flex items-center gap-x-2">
                    <TemplateIcon fill='#1C63E7' fontSize={6}/>
                    <div className="card-h5 ">{defaultTemplates}</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <TemplateEditIcon fill='#1C63E7'/>
                    <div className="card-h5"><span className='#ff3100'></span>{customTemplates}</div>
                </div>
            </div>
        </OverViewCard>
    );
}

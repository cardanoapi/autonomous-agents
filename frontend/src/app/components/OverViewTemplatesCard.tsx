import { TemplateEditIcon } from '@app/assets/icons/TemplateEditIcon';
import TemplateIcon from '@app/assets/icons/TemplatesIcon';

import OverViewCard from './OverViewCard';

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
            <div className="flex w-full items-center gap-x-8 4xl:gap-x-16">
                <div className="flex items-center gap-x-2 w-32">
                    <TemplateIcon fill="#1C63E7" fontSize={6} />
                    <div className="card-h5 ">{defaultTemplates}</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <TemplateEditIcon fill="#1C63E7" />
                    <div className="card-h5">
                        <span className="#ff3100"></span>
                        {customTemplates}
                    </div>
                </div>
            </div>
        </OverViewCard>
    );
}

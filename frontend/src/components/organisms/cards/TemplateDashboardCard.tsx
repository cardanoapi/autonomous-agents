import { TemplateEditIcon } from 'public/icons/TemplateEditIcon';
import TemplateIcon from 'public/icons/TemplatesIcon';

import DashboardBaseCard from './DashboardBaseCard';

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
        <DashboardBaseCard title={title} value={totalTemplates}>
            <div className="flex w-full items-center gap-x-8 4xl:gap-x-16">
                <div className="flex items-center gap-x-2">
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
        </DashboardBaseCard>
    );
}

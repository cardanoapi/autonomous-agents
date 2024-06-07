import { FileCog, FileText } from 'lucide-react';

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
            <div className="flex w-full items-center gap-x-12 4xl:gap-x-12">
                <div className="flex items-center gap-x-2">
                    <FileText stroke="#1C63E7" />
                    <div className="card-h4 ">{defaultTemplates}</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <FileCog stroke="#1C63E7" />
                    <div className="card-h4">
                        <span className="#ff3100"></span>
                        {customTemplates}
                    </div>
                </div>
            </div>
        </OverViewCard>
    );
}

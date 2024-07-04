import React from 'react';

import { ITemplate } from '@app/app/api/templates';
import TemplateCard from '@app/components/molecules/TemplateCard';

interface TemplatesContainerProps {
    templates: ITemplate[];
}

export default function TemplatesContainer({ templates }: TemplatesContainerProps) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 4xl:grid-cols-5">
            {templates.map((item: ITemplate, index: number) => (
                <TemplateCard template={item} templateTrigger={'null'} key={index} />
            ))}
        </div>
    );
}

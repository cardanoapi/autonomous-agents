import React from 'react';

import { ITemplate } from '@app/app/api/templates';
import TemplateCard from '@app/components/molecules/TemplateCard';

interface TemplatesContainerProps {
    templates: ITemplate[];
    enableEdit: boolean;
}

export default function TemplatesContainer({
    templates,
    enableEdit
}: TemplatesContainerProps) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 4xl:grid-cols-5">
            {templates.map((template: ITemplate, index: number) => (
                <TemplateCard template={template} key={index} enableEdit={enableEdit} />
            ))}
        </div>
    );
}

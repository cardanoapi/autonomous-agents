import { ITemplate } from '@app/app/api/templates';
import TemplateCard from '@app/components/molecules/TemplateCard';

interface TemplatesContainerProps {
    templates: ITemplate[];
}

export default function TemplatesContainer({ templates }: TemplatesContainerProps) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2  lg:grid-cols-3 4xl:grid-cols-5 xl:grid-cols-4">
            {templates.map((item: ITemplate, index: number) => (
                <TemplateCard
                    templateName={item.name}
                    templateID={item.id}
                    templateDescription={item.description}
                    templateTrigger={'null'}
                    key={index}
                />
            ))}
        </div>
    );
}
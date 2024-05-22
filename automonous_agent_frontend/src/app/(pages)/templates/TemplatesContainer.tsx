import { ITemplate } from "@app/app/api/templates";
import TemplateCard from "@app/components/molecules/TemplateCard";

interface TemplatesContainerProps {
  templates: ITemplate[];
}


export default function TemplatesContainer({ templates }: TemplatesContainerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 4xl:grid-cols-5 5xl:grid-cols-6 3xl:gap-12 5xl:gap-6 gap-x-4 gap-y-4">
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
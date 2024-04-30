import { ITemplateCard } from "@app/components/molecules/TemplateCard";
import TemplateCard from "@app/components/molecules/TemplateCard";

export default function TemplatesContainer({TemplateCards } : { TemplateCards : ITemplateCard[]}){
    return (
            <div className='grid grid-cols-4 gap-x-4 gap-y-4'>
                {TemplateCards.map((item, index) => (
                    <TemplateCard
                        templateName={item.templateName}
                        templateDescription={item.templateDescription}
                        templateTrigger={item.templateTrigger}
                        key={index}
                        functionCount={item.functionCount}
                    />
                ))}
            </div>
    )
}
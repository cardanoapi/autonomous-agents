import { ITemplateCard } from "@app/components/molecules/TemplateCard";
import TemplateCard from "@app/components/molecules/TemplateCard";

export default function TemplatesContainer({TemplateCards } : { TemplateCards : ITemplateCard[]}){
    return (
            <div className='grid grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-4'>
                {TemplateCards.map((item, index) => (
                    <TemplateCard
                        name={item.name}
                        description={item.description}
                        templateTrigger={item.templateTrigger || 'null'}
                        key={index}
                        functionCount={item.functionCount || 0}
                    />
                ))}
            </div>
    )
}
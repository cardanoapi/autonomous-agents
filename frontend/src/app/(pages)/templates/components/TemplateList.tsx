import { ITemplate } from '@api/templates';

import TemplateCard from '@app/components/molecules/TemplateCard';

const TemplateList = ({
    templates,
    adminAccess,
    currentConnectedWallet
}: {
    templates: ITemplate[];
    adminAccess: boolean;
    currentConnectedWallet: any;
}) => {
    const containerClass =
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4';

    return (
        <div className="flex flex-col gap-y-20 md:pb-10">
            <div className="mt-2 flex flex-col gap-y-5">
                <div className={containerClass}>
                    {templates.map((template: ITemplate, index: number) => (
                        <TemplateCard
                            key={index}
                            template={template}
                            enableDelete={
                                adminAccess && currentConnectedWallet !== null
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateList;

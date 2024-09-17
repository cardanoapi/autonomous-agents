import { ITemplate } from '@api/templates';

import TemplateCard from '@app/components/molecules/TemplateCard';
import { TemplateCardSkeleton } from '@app/components/molecules/TemplateCard';

const TemplateList = ({
    templates,
    isLoading,
    adminAccess,
    currentConnectedWallet
}: {
    templates: ITemplate[];
    isLoading: boolean;
    adminAccess: boolean;
    currentConnectedWallet: any;
}) => {
    const containerClass =
        'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 4xl:grid-cols-5 3xl:pr-12';

    return (
        <div className="flex flex-col gap-y-[80px] pb-10 pt-5">
            <div className="mt-2 flex flex-col gap-y-5">
                {isLoading ? (
                    <div className={containerClass}>
                        <TemplateSkeletonContainer />
                    </div>
                ) : templates.length > 0 ? (
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
                ) : (
                    <span>No Templates Found</span>
                )}
            </div>
        </div>
    );
};

export const TemplateSkeletonContainer = () => {
    return (
        <>
            {Array(10)
                .fill(undefined)
                .map((_, index: number) => (
                    <TemplateCardSkeleton key={index} />
                ))}
        </>
    );
};

export default TemplateList;

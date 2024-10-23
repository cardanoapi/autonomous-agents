import { useAtom } from 'jotai';

import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { templateAtom } from '@app/store/atoms/template';

const TemplateOverview = ({
    isEditing,
    adminAccess
}: {
    isEditing: boolean;
    adminAccess: boolean;
}) => {
    const [template, setTemplate] = useAtom(templateAtom);
    if (!template) return <></>;
    const inputClassName =
        'rounded border text-sm text-brand-Black-300 disabled:opacity-80 border-brand-Black-300/20 px-2 py-1 hover:border-brand-Black-300/50 disabled:border-brand-Black-300/20';
    return (
        <div className={'flex flex-col gap-2'}>
            <div className={'flex flex-col '}>
                <span className={'font-normal text-brand-Black-300'}>Name</span>
                <input
                    value={template.name}
                    onChange={(e) =>
                        setTemplate({
                            ...template,
                            name: e.target.value
                        })
                    }
                    type="text"
                    className={inputClassName}
                    disabled={!adminAccess || !isEditing}
                />
            </div>
            <div className={'flex flex-col'}>
                <span className={'font-normal text-brand-Black-300'}>Description</span>
                <textarea
                    value={template.description}
                    onChange={(e) =>
                        setTemplate({
                            ...template,
                            description: e.target.value
                        })
                    }
                    disabled={!adminAccess || !isEditing}
                    rows={3}
                    className={`${inputClassName} resize-none`}
                />
            </div>
        </div>
    );
};

export const TemplateOverViewSkeleton = () => {
    return (
        <div
            className={
                'flex max-w-[600px] flex-col gap-4 rounded-lg bg-white px-4 py-3'
            }
        >
            <Skeleton className="h-6 w-[140px]" />
            <div className={'flex flex-col gap-2'}>
                <Skeleton className="h-6 w-[140px]" />
                <Skeleton className="h-8 w-full" />
            </div>
            <div className={'flex flex-col gap-2'}>
                <Skeleton className="h-6 w-[140px]" />
                <Skeleton className="h-16 w-full" />
            </div>
            <div className={'flex flex-col gap-2'}>
                <Skeleton className="h-6 w-[140px]" />
                <div className={'flex flex-row flex-wrap gap-4'}>
                    <Skeleton className="h-20 w-[260px]" />
                    <Skeleton className="h-20 w-[260px]" />
                    <Skeleton className="h-20 w-[260px]" />
                    <Skeleton className="h-20 w-[260px]" />
                </div>
            </div>
        </div>
    );
};

export default TemplateOverview;

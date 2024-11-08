import { cn } from "../shadcn/lib/utils";

const ErrorPlaceholder = ({
    className,
    icon: IconComponent,
    title,
    content
}: {
    className?: string;
    icon?: React.ComponentType<React.SVGAttributes<SVGElement>>;
    title?: string;
    content?: string;
}) => (
    <div
        className={cn(
            'flex h-full w-full items-center justify-center rounded border-[4px] border-dashed border-gray-200 bg-slate-50',
            className
        )}
    >
        <div className="flex flex-col items-center gap-2">
            <span className="flex items-center justify-center gap-2 text-xl font-semibold text-gray-300 ">
                {IconComponent && <IconComponent className="mb-1 h-8 w-8" />}
                {title}
            </span>
            <span className="text-base text-gray-300">{content}</span>
        </div>
    </div>
);

export default ErrorPlaceholder;

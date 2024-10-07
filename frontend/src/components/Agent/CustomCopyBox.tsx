import { CopyIcon } from 'lucide-react';

import { cn } from '../lib/utils';
import { SuccessToast } from '../molecules/CustomToasts';

const CustomCopyBox = ({
    title,
    content,
    showCopyIcon = true,
    className
}: {
    title: string;
    content: string | number;
    showCopyIcon?: boolean;
    className?: string;
}) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(content.toString());
        SuccessToast('Copied to clipboard!');
    };

    return (
        <div
            className={cn(
                'flex w-fit flex-col justify-between rounded-lg px-2 py-[6px]',
                className
            )}
        >
            <div className="text-[10px] text-gray-500">{title}</div>
            <div className="flex w-full items-center justify-between gap-2 text-ellipsis text-sm">
                {content === '' ? (
                    <span className="text-xs text-gray-500">---------------------</span>
                ) : (
                    <span className="overflow-hidden text-ellipsis text-nowrap text-xs font-medium ">
                        {content}
                    </span>
                )}
                {showCopyIcon && content !== '' && (
                    <div className="cursor-pointer">
                        <CopyIcon size={16} onClick={handleCopy} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomCopyBox;

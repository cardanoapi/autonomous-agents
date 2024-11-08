'use client';

import { Copy } from 'lucide-react';

import { SuccessToast } from '@app/components/molecules/CustomToasts';

import { cn } from '../shadcn/lib/utils';

const TextDisplayField = ({
    title,
    content,
    showCopy = false,
    textClassName
}: {
    title?: string;
    content?: string | number;
    showCopy?: boolean;
    textClassName?: string;
}) => {
    return (
        <div className={'flex flex-col gap-1'}>
            {/* {title && <h1 className={'text-sm font-medium'}>{title}</h1>} */}
            <div className={'flex items-center gap-1'}>
                <div
                    className={cn(
                        'w-fit max-w-[120px] truncate rounded text-brand-Black-300 sm:max-w-[200px] 3xl:max-w-[350px]',
                        textClassName
                    )}
                >
                    {content}
                </div>
                {showCopy && (
                    <Copy
                        className={'cursor-pointer'}
                        color="#A1A1A1"
                        onClick={() => {
                            navigator.clipboard.writeText(`${content}` || '');
                            SuccessToast(`${title}  Copied!`);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default TextDisplayField;

'use client';

import { Copy } from 'lucide-react';

import { SuccessToast } from '@app/components/molecules/CustomToasts';

const TextDisplayField = ({
    title,
    content,
    showCopy = false
}: {
    title?: string;
    content?: string | number;
    showCopy?: boolean;
}) => {
    return (
        <div className={'flex flex-col gap-1'}>
            {title && <h1 className={'text-sm font-medium'}>{title}</h1>}
            <div className={'flex items-center gap-1'}>
                <div
                    className={
                        'w-fit max-w-[80px] truncate rounded text-brand-Black-300 sm:max-w-[150px] 3xl:max-w-[350px] '
                    }
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

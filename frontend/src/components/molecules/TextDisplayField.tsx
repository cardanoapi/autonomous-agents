'use client';

import { Copy } from 'lucide-react';

import { SuccessToast } from '@app/components/molecules/CustomToasts';

const TextDisplayField = ({
    title,
    content,
    showCopy = false
}: {
    title: string;
    content?: string | number;
    showCopy?: boolean;
}) => {
    return (
        <div className={'flex flex-col gap-2'}>
            <h1 className={'text-sm font-medium'}>{title}</h1>
            <div className={'flex items-center gap-1'}>
                <div
                    className={
                        'w-fit min-w-[360px] max-w-[600px] truncate rounded border-0 border-b border-gray-300 px-4 py-2 drop-shadow-md'
                    }
                >
                    {content}
                </div>
                {showCopy && (
                    <Copy
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

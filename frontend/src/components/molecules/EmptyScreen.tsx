import Link from 'next/link';

import EmptyBoxIcon from '@app/assets/icons/EmptyBoxIcon';

export default function EmptyScreen({
    msg = 'No Data',
    linkHref,
    linkMsg,
    linkOnCLick,
    customIcon
}: {
    msg?: string;
    linkHref?: string;
    linkMsg?: string;
    linkOnCLick?: any;
    customIcon?: any;
}) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-brand-White-100">
            {customIcon ? customIcon : <EmptyBoxIcon />}
            <span className="font-mono text-base text-gray-500 xl:text-xl">{msg}</span>
            {linkMsg && linkHref && (
                <Link href={linkHref} className="mt-1 text-sm font-semibold text-brand-Blue-200 hover:cursor-pointer">
                    {linkMsg}{' '}
                </Link>
            )}
            {linkMsg && linkOnCLick && (
                <span
                    className="mt-1 text-sm font-semibold text-brand-Blue-200 hover:cursor-pointer xl:text-sm"
                    onClick={linkOnCLick}
                >
                    {linkMsg}
                </span>
            )}
        </div>
    );
}

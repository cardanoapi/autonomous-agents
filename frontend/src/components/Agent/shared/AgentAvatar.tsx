import Link from 'next/link';

import { toSvg } from 'jdenticon';

export const generateIdentIcon = (hash: string, size: number) => {
    const svg = toSvg(hash, size);
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const AgentAvatar = ({
    hash,
    size,
    isActive,
    activeStatus = true,
    isLink = false
}: {
    hash: string;
    size: number;
    isActive: boolean;
    activeStatus?: boolean;
    isLink?: boolean;
}) => {
    const src = generateIdentIcon(hash, size);
    return isLink ? (
        <Link href={`/agents/${hash}`} className='w-fit bg-red-100'>
            <div
                className={
                    'relative cursor-pointer rounded-full bg-brand-Blue-300/10 p-1'
                }
            >
                <img
                    src={src}
                    alt="Identicon"
                    width={size}
                    height={size}
                    className={'rounded-full'}
                />
                {activeStatus && (
                    <div
                        className={`absolute -right-1 bottom-0 z-10 h-4 w-4 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}
                    ></div>
                )}
            </div>
        </Link>
    ) : (
        <div className={'relative rounded-full bg-brand-Blue-300/10 p-1'}>
            <img
                src={src}
                alt="Identicon"
                width={size}
                height={size}
                className={'rounded-full'}
            />
            {activeStatus && (
                <div
                    className={`absolute -right-1 bottom-0 z-10 h-4 w-4 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}
                ></div>
            )}
        </div>
    );
};

export default AgentAvatar;

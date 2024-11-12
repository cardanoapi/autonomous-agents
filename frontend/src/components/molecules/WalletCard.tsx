import { Typography } from '@mui/material';

import { cn } from '@app/components/shadcn/lib/utils';

export default function WalletCard({
    address,
    className,
    onDisconnect,
    iconSrc
}: {
    address: string;
    className?: string;
    onDisconnect?: any;
    iconSrc?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col rounded-lg border-2 border-brand-Gray-400 p-2',
                className
            )}
        >
            <div className="flex items-center gap-2">
                <img src={iconSrc} height={32} width={32}></img>
                <div className="h3 text-brand-Blue-200">Connected Wallet</div>
            </div>
            <div>
                <Typography className="break-all text-xs text-brand-Black-200">
                    {address}
                </Typography>
                <span
                    className="flex cursor-pointer justify-end text-xs text-brand-navy hover:text-brand-Blue-200"
                    onClick={onDisconnect}
                >
                    Disconnect
                </span>
            </div>
        </div>
    );
}

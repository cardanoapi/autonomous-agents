import { Typography } from '@mui/material';
import { useAtom } from 'jotai';

import { cn } from '@app/components/lib/utils';
import { currentConnectedWalletAtom } from '@app/store/localStore';

export default function ConnectedWalletCard({
    className,
    onDisconnect
}: {
    className?: string;
    onDisconnect?: any;
}) {
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);

    return (
        <div
            className={cn(
                'flex flex-col gap-1 rounded-lg border-2 border-brand-Gray-400 p-2',
                className
            )}
        >
            <div className="flex items-center gap-2">
                <img
                    src={currentConnectedWallet ? currentConnectedWallet.icon : ''}
                    height={32}
                    width={32}
                ></img>
                <div className="h3 text-brand-Blue-200">Connected Wallet</div>
            </div>
            <div>
                <Typography className="break-all text-xs text-brand-Black-200">
                    {currentConnectedWallet ? currentConnectedWallet.address : ''}
                </Typography>
                <span
                    className="mt-1 flex cursor-pointer justify-end text-xs text-brand-navy hover:text-brand-Blue-200"
                    onClick={onDisconnect}
                >
                    Disconnect
                </span>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SendLogoutRequest } from '@api/auth';
import { PATHS } from '@consts';
import { Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { Boxes } from 'lucide-react';

import DashBoardIcon from '@app/components/icons/DashboardIcon';
import GovernanceActionIcon from '@app/components/icons/GovernanceActionIcon';
import Logo from '@app/components/icons/Logo';
import LogsIcon from '@app/components/icons/LogsIcon';
import TemplateIcon from '@app/components/icons/TemplatesIcon';
import SideNavLink from '@app/components/layout/SideNavLink';
import {
    adminAccessAtom,
    walletApiAtom,
    walletStakeAddressAtom
} from '@app/store/localStore';

import WalletSignInDialog from '../Auth/WalletSignInDialog';
import { Button } from '../atoms/Button';
import AgentsIcon from '../icons/AgentsIcon';
import MyAgentIcon from '../icons/MyAgentIcon';
import { cn } from '../lib/utils';
import { SuccessToast } from '../molecules/CustomToasts';

export interface ISideNavItem {
    title: string;
    href: string;
    icon: any;
    hidden?: boolean;
}

export default function SideNav() {
    const [walletApi, setWalletApi] = useAtom(walletApiAtom);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [walletStakeAddress, setWalletStakeAddress] = useAtom(walletStakeAddressAtom);
    const [adminAccess, setAdminAcess] = useAtom(adminAccessAtom);

    const SideNavItems: ISideNavItem[] = [
        {
            title: 'Dashboard',
            href: '/',
            icon: DashBoardIcon
        },
        {
            title: 'Agents',
            href: '/agents',
            icon: AgentsIcon
        },
        {
            title: 'Templates',
            href: '/templates',
            icon: TemplateIcon
        },
        {
            title: 'DRep Directory',
            href: PATHS.dRepDirectory,
            icon: Boxes
        },
        {
            title: 'Governance Actions',
            href: PATHS.governanceActions,
            icon: GovernanceActionIcon
        },
        {
            title: 'Logs',
            href: '/logs',
            icon: LogsIcon
        },
        {
            title: 'My Agent',
            href: '/my-agent',
            icon: MyAgentIcon,
            hidden: adminAccess
        }
    ];

    const router = useRouter();

    function toggleDialog() {
        dialogOpen ? setDialogOpen(false) : setDialogOpen(true);
    }

    function handleDisconnect() {
        setWalletApi(null);
        setWalletStakeAddress(null);
        localStorage.removeItem('wallet_provider');
        localStorage.removeItem('wallet_stake_address');
        SendLogoutRequest();
        SuccessToast('Wallet Disconnected');
        setAdminAcess(false);
        router.push('/');
    }

    return (
        <>
            <WalletSignInDialog
                refDialogOpen={dialogOpen}
                onComplete={toggleDialog}
                onClose={toggleDialog}
            />
            <nav className="overflow-wrap flex h-full w-full flex-col border-r-[0.5px] bg-white">
                <Link
                    href="/"
                    className="flex flex-row items-center gap-x-2  py-8 pb-6 pl-4  "
                >
                    <Logo height={48} width={48} />
                    <div>
                        <span className="h3 !bg-gradient-to-t from-zinc-500 to-zinc-900 !bg-clip-text !font-medium !text-transparent">
                            Autonomous
                        </span>
                        <br />
                        <span className="h2 !bg-gradient-to-t from-zinc-500 to-zinc-900 !bg-clip-text !font-semibold !text-transparent">
                            Agent Testing
                        </span>
                    </div>
                </Link>
                <div className=" flex w-full flex-grow flex-col justify-between">
                    <div className=" mt-6 flex flex-col gap-y-4 px-2">
                        {SideNavItems.map((Prop, index) => (
                            <SideNavLink key={index} Prop={Prop} />
                        ))}
                    </div>
                    {walletApi !== null ? (
                        <CurrentWalletDiv
                            address={walletStakeAddress || ''}
                            className="m-2"
                            onDisconnect={handleDisconnect}
                        />
                    ) : (
                        <Button
                            className="m-2"
                            onClick={toggleDialog}
                            variant={'primary'}
                        >
                            Connect Wallet
                        </Button>
                    )}
                </div>
            </nav>
        </>
    );
}

function CurrentWalletDiv({
    address,
    className,
    onDisconnect
}: {
    address: string;
    className?: string;
    onDisconnect?: any;
}) {
    return (
        <div
            className={cn(
                'flex flex-col rounded-lg border-2 border-brand-Gray-400 p-2',
                className
            )}
        >
            <div className="h3 text-brand-Blue-200">Connected Wallet</div>
            <div>
                <Typography className="break-all text-xs text-brand-Black-200">
                    {address}
                </Typography>
                <span
                    className="flex cursor-pointer justify-end text-xs text-brand-navy"
                    onClick={onDisconnect}
                >
                    Disconnect
                </span>
            </div>
        </div>
    );
}

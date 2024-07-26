'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SendLogoutRequest } from '@api/auth';
import { PATHS } from '@consts';
import { Typography } from '@mui/material';
import { useAtom } from 'jotai';
import Cookies from 'js-cookie';
import { CIP30Provider } from 'kuber-client/types';
import { Boxes } from 'lucide-react';

import DashBoardIcon from '@app/components/icons/DashboardIcon';
import GovernanceActionIcon from '@app/components/icons/GovernanceActionIcon';
import Logo from '@app/components/icons/Logo';
import LogsIcon from '@app/components/icons/LogsIcon';
import TemplateIcon from '@app/components/icons/TemplatesIcon';
import SideNavLink from '@app/components/layout/SideNavLink';
import {
    adminAccessAtom,
    savedWalletAtom,
    walletApiAtom,
    walletConnectedAtom
} from '@app/store/localStore';
import { listProviders } from '@app/utils/wallet';
import { getStakeAddress } from '@app/utils/wallet';

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
    const [adminAccess, setAdminAcess] = useAtom(adminAccessAtom);
    const [savedWallet, setSavedWallet] = useAtom(savedWalletAtom);
    const [walletConnected, setWalletConencted] = useAtom(walletConnectedAtom);

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
        }
    ];

    const MyAgentSideNavItem: ISideNavItem = {
        title: 'My Agent',
        href: '/my-agent',
        icon: MyAgentIcon,
        hidden: adminAccess
    };

    const router = useRouter();

    async function toggleDialog() {
        dialogOpen ? setDialogOpen(false) : setDialogOpen(true);
    }

    async function conenctWallet() {
        const prevWalletConnected = await enablePrevWallet();
        if (!prevWalletConnected) {
            setSavedWallet({ name: null, stakeAddress: null });
            toggleDialog();
        }
    }

    function handleDisconnect() {
        setWalletApi(null);
        setSavedWallet({ name: null, stakeAddress: null });
        setWalletConencted(false);
        SendLogoutRequest();
        setAdminAcess(false);
        SuccessToast('Wallet Disconnected');
        router.push('/');
    }

    async function enablePrevWallet() {
        const accessToken = Cookies.get('access_token');

        //console.log(savedWallet)

        //console.log(savedWallet.name , savedWallet.stakeAddress , accessToken)
        //console.log(accessToken)
        if (savedWallet.name && savedWallet.stakeAddress && accessToken) {
            const wallet = listProviders().find(
                (wallet) => wallet.name === savedWallet.name
            );

            if (wallet) {
                const enabledApi = await wallet.enable();
                const walletStakeAddress = await getStakeAddress(enabledApi);

                if (
                    walletStakeAddress &&
                    walletStakeAddress === savedWallet.stakeAddress
                ) {
                    console.log(walletStakeAddress);
                    console.log(savedWallet.stakeAddress);
                    setSavedWallet({
                        name: wallet.name,
                        stakeAddress: walletStakeAddress
                    });
                    setWalletApi(enabledApi);
                    setWalletConencted(true);
                    console.log('Enabled previous wallet');
                    return true;
                }
            }
        }
        console.log('Failed to enable previous wallet');
        setSavedWallet({ name: null, stakeAddress: null });
        setWalletConencted(false);
        setAdminAcess(false);
        setWalletApi(null);
        return false;
    }

    // useEffect(()=> {
    //    console.log(savedWalletAtom)
    //   enablePrevWallet()
    // }, []);

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
                    <div className="mt-6 flex flex-col gap-y-4 px-2">
                        {SideNavItems.map((Prop, index) => (
                            <SideNavLink key={index} Prop={Prop} />
                        ))}
                    </div>
                    {walletApi !== null && walletConnected ? (
                        <div className="flex flex-col gap-x-2 gap-y-4 px-2 pb-2">
                            <SideNavLink key={1} Prop={MyAgentSideNavItem} />
                            <CurrentWalletDiv
                                address={savedWallet.stakeAddress || ''}
                                onDisconnect={handleDisconnect}
                                iconSrc={
                                    listProviders().find(
                                        (item: CIP30Provider) =>
                                            item.name === savedWallet.name
                                    )?.icon || ''
                                }
                            />
                        </div>
                    ) : (
                        <Button
                            className="m-2"
                            onClick={conenctWallet}
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
                    className="flex cursor-pointer justify-end text-xs text-brand-navy"
                    onClick={onDisconnect}
                >
                    Disconnect
                </span>
            </div>
        </div>
    );
}

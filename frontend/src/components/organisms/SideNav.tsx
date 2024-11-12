'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { fetchMyAgent } from '@api/agents';
import { CheckUserStatus, SendLogoutRequest } from '@api/auth';
import { PATHS } from '@consts';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { Boxes } from 'lucide-react';
import AgentsIcon from 'public/icons/AgentsIcon';
import DashBoardIcon from 'public/icons/DashboardIcon';
import GovernanceActionIcon from 'public/icons/GovernanceActionIcon';
import LogsIcon from 'public/icons/LogsIcon';
import TemplateIcon from 'public/icons/TemplatesIcon';

import { Button } from '@app/components/atoms/Button';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import WalletSignInDialog from '@app/components/organisms/WalletSignInDialog';
import { adminAccessAtom, currentConnectedWalletAtom } from '@app/store/localStore';

import MyAgentCard from './cards/MyAgentCard';
import SideNavLogo from '../molecules/SideNavLogo';
import WalletCard from '../molecules/WalletCard';
import SideNavLink from '../atoms/SideNavLink';

export interface ISideNavItem {
    title: string;
    href: string;
    icon: any;
    hidden?: boolean;
}

export default function SideNav() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentConnectedWallet, setCurrentConnectedWallet] = useAtom(
        currentConnectedWalletAtom
    );
    const [adminAccess, setAdminAccess] = useAtom(adminAccessAtom);
    const router = useRouter();

    const { data: userStatus } = useQuery({
        queryKey: ['userSatus'],
        queryFn: async () => {
            return CheckUserStatus();
        },
        refetchInterval: 30000
    });

    const { data: myAgent } = useQuery({
        queryKey: ['myAgent'],
        queryFn: async () => {
            if (currentConnectedWallet && !adminAccess) {
                return await fetchMyAgent();
            }
            return null;
        },
        enabled: !!currentConnectedWallet && adminAccess === false, // Only enable when conditions are met
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchInterval: 5000,
        refetchIntervalInBackground: true
    });

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

    const toggleDialog = () => {
        dialogOpen ? setDialogOpen(false) : setDialogOpen(true);
    };

    const handleDisconnect = () => {
        setAdminAccess(false);
        setCurrentConnectedWallet(null);
        SendLogoutRequest();
        SuccessToast('Wallet Disconnected');
        router.push('/');
    };

    useEffect(() => {
        if (
            userStatus === false ||
            (userStatus && !userStatus.is_admin) ||
            currentConnectedWallet === null
        ) {
            // Remove admin access for unauthenticated users, non-admins, or if wallet info is missing
            setAdminAccess(false);
        } else {
            // Grant admin access if the user is an admin and wallet info is present
            setAdminAccess(true);
        }
        // Reset currentConnectedWallet if userStatus is false
        if (userStatus === false) {
            setCurrentConnectedWallet(null);
        }
    }, [userStatus]);

    const renderMyAgentCard = () => {
        return (
            <MyAgentCard
                agent={myAgent}
                onClick={() => {
                    router.push(`/agents/${myAgent?.id}`);
                }}
            />
        );
    };

    const renderMyWalletCard = () => {
        return (
            <WalletCard
                address={
                    (currentConnectedWallet && currentConnectedWallet.address) || ''
                }
                onDisconnect={handleDisconnect}
                iconSrc={(currentConnectedWallet && currentConnectedWallet.icon) || ''}
            />
        );
    };

    return (
        <>
            <WalletSignInDialog
                refDialogOpen={dialogOpen}
                onComplete={toggleDialog}
                onClose={toggleDialog}
            />
            <nav className="overflow-wrap flex h-full w-full flex-col border-r-[0.5px] bg-white">
                <SideNavLogo />

                <div className=" flex w-full flex-grow flex-col justify-between">
                    <div className="mt-6 flex flex-col gap-y-4 px-2">
                        {SideNavItems.map((Prop, index) => (
                            <SideNavLink key={index} Prop={Prop} />
                        ))}
                    </div>

                    {currentConnectedWallet !== null && (
                        <div className="mt-6 flex flex-col gap-y-4 px-2">
                            {/* Show My Agent Card if only user is not admin */}
                            <div className="flex flex-col gap-x-2 gap-y-4 px-2 pb-2">
                                {adminAccess === false && renderMyAgentCard()}
                            </div>
                            {renderMyWalletCard()}
                        </div>
                    )}

                    {currentConnectedWallet === null && (
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

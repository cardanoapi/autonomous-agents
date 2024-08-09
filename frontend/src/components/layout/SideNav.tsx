'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { IAgent, fetchMyAgent } from '@api/agents';
import { SendLogoutRequest } from '@api/auth';
import { PATHS } from '@consts';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import cookie from 'js-cookie';
import { Boxes, Wallet } from 'lucide-react';

import DashBoardIcon from '@app/components/icons/DashboardIcon';
import GovernanceActionIcon from '@app/components/icons/GovernanceActionIcon';
import Logo from '@app/components/icons/Logo';
import LogsIcon from '@app/components/icons/LogsIcon';
import TemplateIcon from '@app/components/icons/TemplatesIcon';
import SideNavLink from '@app/components/layout/SideNavLink';
import { adminAccessAtom, currentConnectedWalletAtom } from '@app/store/localStore';

import AgentAvatar from '../Agent/AgentAvatar';
import WalletSignInDialog from '../Auth/WalletSignInDialog';
import { Button } from '../atoms/Button';
import AgentsIcon from '../icons/AgentsIcon';
import MyAgentIcon from '../icons/MyAgentIcon';
import { cn } from '../lib/utils';
import { SuccessToast } from '../molecules/CustomToasts';
import { Skeleton } from '../shadcn/ui/skeleton';

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

    const { data: myAgent } = useQuery({
        queryKey: ['myAgent'],
        queryFn: async () => {
            if (currentConnectedWallet && adminAccess === false) {
                const agent = await fetchMyAgent();
                return agent;
            }
            return null;
        },
        refetchInterval: 5000
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

    const router = useRouter();

    function toggleDialog() {
        dialogOpen ? setDialogOpen(false) : setDialogOpen(true);
    }

    function handleDisconnect() {
        setAdminAccess(false);
        setCurrentConnectedWallet(null);
        SendLogoutRequest();
        SuccessToast('Wallet Disconnected');
        router.push('/');
    }

    useEffect(() => {
        const access_token = cookie.get('access_token');
        if (access_token === null || access_token === undefined) {
            setAdminAccess(false);
            setCurrentConnectedWallet(null);
        }
    }, []);

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
                    {currentConnectedWallet !== null ? (
                        <div className="mt-6 flex flex-col gap-y-4 px-2">
                            {/* Show My Agent Card if only user is not admin  */}
                            <div className="flex flex-col gap-x-2 gap-y-4 px-2 pb-2">
                                {adminAccess === false && (
                                    <MyAgentCard
                                        agent={myAgent}
                                        onClick={() => {
                                            router.push(`/agents/${myAgent?.id}`);
                                        }}
                                    />
                                )}
                                <CurrentWalletDiv
                                    address={currentConnectedWallet.address || ''}
                                    onDisconnect={handleDisconnect}
                                    iconSrc={currentConnectedWallet.icon}
                                />
                            </div>
                        </div>
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

function MyAgentCard({
    agent,
    onClick = {}
}: {
    agent: IAgent | null | undefined;
    onClick?: any;
}) {
    if (!agent) return <MyAgentSkeleton />;
    return (
        <div
            className="flex items-center gap-x-4 gap-y-2 rounded-lg border-2 border-brand-Gray-400 p-2 hover:cursor-pointer hover:bg-gray-100"
            onClick={onClick}
        >
            <div className="flex items-center">
                <AgentAvatar
                    hash={agent.id}
                    size={32}
                    isActive={agent.is_active || false}
                    isLink={false}
                />
            </div>
            <div className="flex flex-col">
                <span className="h3 text-brand-Blue-200">My Agent</span>
                <span className="break-all text-xs text-brand-Black-200">
                    {agent.name}
                </span>
            </div>
        </div>
    );
}

const MyAgentSkeleton = () => {
    return (
        <div className="flex items-center gap-x-4 gap-y-2 rounded-lg border-2 border-brand-Gray-400 p-2 hover:cursor-pointer">
            <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex flex-col gap-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    );
};

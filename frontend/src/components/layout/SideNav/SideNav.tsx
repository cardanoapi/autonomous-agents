'use client';

import { useEffect, useState } from 'react';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import { SendLogoutRequest, getUserStatus } from '@api/auth';
import { IUserStatusResponse } from '@api/auth';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import WalletSignInDialog from '@app/components/Auth/WalletSignInDialog';
import { Button } from '@app/components/atoms/Button';
import ConnectedWalletCard from '@app/components/layout/SideNav/ConnectedWalletCard';
import MyAgentCard from '@app/components/layout/SideNav/MyAgentCard';
import { SideNavItems } from '@app/components/layout/SideNav/SideNavData';
import SideNavItem from '@app/components/layout/SideNav/SideNavItem';
import SideNavLogo from '@app/components/layout/SideNav/SideNavLogo';
import { cn } from '@app/components/lib/utils';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { ErrorToast } from '@app/components/molecules/CustomToasts';
import { adminAccessAtom, currentConnectedWalletAtom } from '@app/store/localStore';
import { X } from 'lucide-react';
import { set } from 'lodash';
import { render } from 'nprogress';

export default function SideNav({
    mobileClassName,
    desktopClassName
}: {
    mobileClassName?: string;
    desktopClassName?: string;
}) {
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [currentConnectedWallet, setCurrentConnectedWallet] = useAtom(
        currentConnectedWalletAtom
    );
    const [sideNavOpen, setSideNavOpen] = useState<boolean>(false);
    const [adminAccess, setAdminAccess] = useAtom(adminAccessAtom);
    const router: AppRouterInstance = useRouter();

    const { data: userStatus } = useQuery({
        queryKey: ['userStatus'],
        queryFn: async (): Promise<IUserStatusResponse | false> => {
            return getUserStatus();
        },
        refetchInterval: 30000,
        enabled: currentConnectedWallet !== null
    });

    useEffect((): void => {
        const isAdmin: boolean = (userStatus && userStatus.is_admin) || false;
        const hasWallet: boolean = currentConnectedWallet !== null;
        setAdminAccess(isAdmin && hasWallet);
        if (userStatus === false) {
            setCurrentConnectedWallet(null);
        }
    }, [userStatus]);

    const logoutUser = (): void => {
        setAdminAccess(false);
        setCurrentConnectedWallet(null);
        SendLogoutRequest().then(() => {
            SuccessToast('Wallet Disconnected');
            router.push('/');
        });
    };

    const WalletandAgentCard = ({onConnectWallet , onDisconnect} : {onConnectWallet?: any , onDisconnect?: any} ) =>{
        return (
              currentConnectedWallet ? (
                    <div className={'flex flex-col gap-y-2 pb-2'}>
                        {!adminAccess && <MyAgentCard onClick={()=>setSideNavOpen(false)}/>}
                        <ConnectedWalletCard onDisconnect={() => {
                            onDisconnect()
                            onConnectWallet && logoutUser()
                        }}
                           />
                    </div>
                ) : (
                    <Button
                        className="m-2 max-md:rounded-full"
                        onClick={() => {
                            onDisconnect && onDisconnect()
                            setLoginDialogOpen(true)
                        }}
                        variant={'primary'}
                    >
                        Connect Wallet
                    </Button>
                )
        )
    }

    return (
        <div>
            <HamburgerMenuIcon
                className={'absolute right-4 top-4 font-black md:hidden'}
                height={24}
                width={24}
                onClick={() => setSideNavOpen(!sideNavOpen)}
            />

            <WalletSignInDialog
                refDialogOpen={loginDialogOpen}
                onComplete={() => {
                    setLoginDialogOpen(false);
                }}
                onClose={() => {
                    setLoginDialogOpen(false);
                }}
            />

            {/* Desktop Navigation*/}
            <nav
                className={cn(
                    'flex h-full w-full flex-col justify-between border-r-[0.5px] bg-white px-2 ',
                    desktopClassName
                )}
            >
                <div className={'flex w-full flex-col'}>
                    <SideNavLogo />
                    <ul className="mt-6 flex w-full flex-col gap-y-4">
                        {SideNavItems.map((Prop, index) => (
                            <SideNavItem key={index} Prop={Prop} />
                        ))}
                    </ul>
                </div>
                <WalletandAgentCard/>
            </nav>
            {/* Mobile Side Navigation */}
            <>
                {/* Overlay */}
                {sideNavOpen && (
                    <div
                        className={cn(
                            'md:hidden fixed inset-0 z-[998] bg-black bg-opacity-50 transition-opacity duration-300',
                            mobileClassName
                        )}
                        onClick={() => setSideNavOpen(false)}
                    />
                )}
                <div
                    className={cn(
                        'fixed left-0 top-0 z-[999] flex h-full w-full flex-col justify-between bg-white shadow-lg md:hidden',
                        'transform transition-transform duration-300 rounded-t-2xl',
                        sideNavOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    <nav className="flex h-full w-full flex-col justify-between px-2">
                        <X className='absolute right-3 top-4' onClick={() => setSideNavOpen(false)}/>
                        <div>
                            <SideNavLogo renderLogo={false} />
                            <ul className="mt-4 flex w-full flex-col gap-y-4">
                                {SideNavItems.map((Prop, index) => (
                                    <SideNavItem
                                        key={index}
                                        Prop={Prop}
                                        onClick={() => setSideNavOpen(false)}
                                    />
                                ))}
                            </ul>
                        </div>
                        <WalletandAgentCard onDisconnect={() => setSideNavOpen(false)} onConnectWallet={() => setSideNavOpen(false)}/>
                    </nav>
                </div>
            </>
        </div>
    );
}

'use client';

import { useState , useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserStatus, SendLogoutRequest } from '@api/auth';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import WalletSignInDialog from '@app/components/Auth/WalletSignInDialog';
import { Button } from '@app/components/atoms/Button';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { adminAccessAtom, currentConnectedWalletAtom } from '@app/store/localStore';
import MyAgentCard from '@app/components/layout/SideNav/MyAgentCard';
import SideNavLogo from '@app/components/layout/SideNav/SideNavLogo';
import ConnectedWalletCard from '@app/components/layout/SideNav/ConnectedWalletCard';
import { SideNavItems } from '@app/components/layout/SideNav/SideNavData';
import SideNavItem from '@app/components/layout/SideNav/SideNavItem';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { IUserStatusResponse } from '@api/auth';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import {cn} from '@app/components/lib/utils'
import { ErrorToast } from '@app/components/molecules/CustomToasts';

export default function SideNav({className} : {className?: string}) {
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [currentConnectedWallet, setCurrentConnectedWallet] = useAtom(currentConnectedWalletAtom);
    const [sideNavOpen, setSideNavOpen] = useState<boolean>(false);
    const [adminAccess, setAdminAccess] = useAtom(adminAccessAtom);
    const router : AppRouterInstance = useRouter();

    const { data: userStatus } = useQuery({
        queryKey: ['userStatus'],
        queryFn: async () : Promise<IUserStatusResponse|false> => {
            return getUserStatus();
        },
        refetchInterval: 30000,
        enabled : currentConnectedWallet !== null,
    });

    useEffect(() : void => {
            const isAdmin  : boolean = userStatus && userStatus.is_admin || false;
            const hasWallet : boolean = currentConnectedWallet !== null;
            setAdminAccess(isAdmin && hasWallet);
            if (userStatus === false) {
                 setCurrentConnectedWallet(null);
            }
    }, [userStatus]);

    const logoutUser  = () : void => {
        setAdminAccess(false);
        setCurrentConnectedWallet(null);
        SendLogoutRequest().then(()=>{
            SuccessToast('Wallet Disconnected');
            router.push('/');
        });
    };


    return (
        <div className={cn(className)}>
            <HamburgerMenuIcon  className={"md:hidden absolute top-4 right-4 font-black"} height={24} width={24} onClick={()=>setSideNavOpen(!sideNavOpen)}/>

            <WalletSignInDialog
                refDialogOpen={loginDialogOpen}
                onComplete={()=>{setLoginDialogOpen(false)}}
                onClose={() => {setLoginDialogOpen(false)}}
            />

            {/* Desktop Navigation*/}
            <nav className="h-screen overflow-wrap flex-col border-r-[0.5px] bg-white justify-between px-2 hidden md:flex w-[256px] overflow-hidden 3xl:w-[290px]">
                <div>
                  <SideNavLogo />
                    <ul className="mt-6 flex flex-col gap-y-4">
                        {SideNavItems.map((Prop, index) => (
                            <SideNavItem key={index} Prop={Prop} />
                        ))}
                    </ul>
                </div>
                {currentConnectedWallet ? (
                        <div className={"gap-y-2 pb-2 flex flex-col"}>
                            {!adminAccess && <MyAgentCard/>}
                            <ConnectedWalletCard onDisconnect={logoutUser}/>
                        </div>
                    )  :
                        <Button
                            className="m-2"
                            onClick={()=>setLoginDialogOpen(true)}
                            variant={'primary'}
                        >
                            Connect Wallet
                        </Button>
                    }
            </nav>
            {/* Mobile Side Navigation */}
            <>
                {/* Overlay */}
                {sideNavOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-[998]"
                        onClick={() => setSideNavOpen(false)}
                    />
                )}
                <div
                    className={cn(
                        "fixed top-0 left-0 h-screen w-64 bg-white flex flex-col justify-between z-[999] shadow-lg",
                        "transition-transform duration-300 transform",
                        sideNavOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <nav className="h-screen w-full flex flex-col justify-between px-2">
                        <div>
                            <SideNavLogo renderLogo={false}/>
                            <ul className="mt-4 flex flex-col gap-y-4">
                                {SideNavItems.map((Prop, index) => (
                                    <SideNavItem key={index} Prop={Prop} onClick={()=>setSideNavOpen(false)}/>
                                ))}
                            </ul>
                        </div>
                            <Button
                                className="m-2"
                                onClick={() => ErrorToast('Mobile Browsers are not supported!')}
                                variant="primary"
                            >
                                Connect Wallet
                            </Button>
                    </nav>
                </div>
            </>
        </div>
    );
}

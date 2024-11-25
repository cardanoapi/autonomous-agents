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

export default function SideNav({className} : {className?: string}) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentConnectedWallet, setCurrentConnectedWallet] = useAtom(currentConnectedWalletAtom);
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
            console.log(userStatus);
            console.log(currentConnectedWallet)
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
        <div className={className}>
            <WalletSignInDialog
                refDialogOpen={dialogOpen}
                onComplete={()=>{setDialogOpen(false)}}
                onClose={() => {setDialogOpen(false)}}
            />
            <nav className="h-full w-full overflow-wrap flex flex-col border-r-[0.5px] bg-white justify-between px-2">
                <div>
                  <SideNavLogo />
                    <li className="mt-6 flex flex-col gap-y-4">
                        {SideNavItems.map((Prop, index) => (
                            <SideNavItem key={index} Prop={Prop} />
                        ))}
                    </li>
                </div>
                {currentConnectedWallet ? (
                        <div className="flex flex-col gap-y-2 pb-2">
                            {!adminAccess && <MyAgentCard/>}
                            <ConnectedWalletCard onDisconnect={logoutUser}/>
                        </div>
                    )  :
                        <Button
                            className="m-2"
                            onClick={()=>setDialogOpen(true)}
                            variant={'primary'}
                        >
                            Connect Wallet
                        </Button>
                    }
            </nav>
        </div>
    );
}

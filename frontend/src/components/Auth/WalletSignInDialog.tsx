'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SendLoginRequest } from '@api/auth';
import { useAtom } from 'jotai';
import Cookies from 'js-cookie';
import { CIP30Provider } from 'kuber-client/types';
import { OctagonAlert, Wallet } from 'lucide-react';
import { X } from 'lucide-react';

import { Dialog, DialogContent } from '@app/components/atoms/Dialog';
import {
    adminAccessAtom,
    walletApiAtom,
    walletStakeAddressAtom
} from '@app/store/localStore';
import { generateSignedData } from '@app/utils/auth';

import { Button } from '../atoms/Button';
import { cn } from '../lib/utils';
import { ErrorToast, SuccessToast } from '../molecules/CustomToasts';

function listProviders(): CIP30Provider[] {
    const pluginMap = new Map();
    //@ts-ignore
    if (!window.cardano) {
        return [];
    }
    //@ts-ignore
    Object.keys(window.cardano).forEach((x) => {
        //@ts-ignore
        const plugin: CIP30Provider = window.cardano[x];
        //@ts-ignore
        if (plugin.enable && plugin.name) {
            pluginMap.set(plugin.name, plugin);
        }
    });
    const providers = Array.from(pluginMap.values());
    // yoroi doesn't work (remove this after yoroi works)
    return providers.filter((x) => x.name != 'yoroi');
}

export default function WalletSignInDialog({
    refDialogOpen = false,
    onComplete,
    onClose
}: {
    refDialogOpen?: boolean;
    onComplete?: any;
    onClose?: any;
}) {
    //to do save to atom WalletAPI
    const [, setWalletApi] = useAtom(walletApiAtom);
    const [, setWalletStakeAddress] = useAtom(walletStakeAddressAtom);
    const [walletProviders, setWalletProviders] = useState<CIP30Provider[]>([]);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [, setAdminAcess] = useAtom(adminAccessAtom);

    const router = useRouter();

    const [currentSelectedWalletProvider, setCurrentSelectedWalletProvider] =
        useState<CIP30Provider | null>(null);
    const [connectingWallet, setConnectingWallet] = useState<boolean>(false);

    async function enableWallet(wallet: CIP30Provider, disabletoast: boolean = false) {
        console.log(`Enabling ${wallet.name}`);
        setConnectingWallet(true);
        try {
            const enabledApi = await wallet.enable();
            const signedData = await generateSignedData(enabledApi);
            console.log(signedData);

            const response = await SendLoginRequest(signedData);
            response.isSuperUser ? setAdminAcess(true) : setAdminAcess(false);
            if (response) {
                onComplete();
                setConnectingWallet(false);
                const rewardAddresses = await enabledApi.getRewardAddresses();
                const walletStakeAddress =
                    rewardAddresses.length > 0 ? rewardAddresses[0] : null;
                setWalletApi(enabledApi);
                setWalletStakeAddress(walletStakeAddress);
                localStorage.setItem('wallet_provider', wallet.name);
                walletStakeAddress
                    ? localStorage.setItem('wallet_stake_address', walletStakeAddress)
                    : {};
                router.push('/');
            }
            if (!disabletoast) {
                setDialogOpen(false);
                SuccessToast('Wallet Connected!');
            }
        } catch (error: any) {
            ErrorToast('Unable to Sign In. Please try again');
            setConnectingWallet(false);
            localStorage.removeItem('wallet');
        }
    }

    useEffect(() => {
        const wallets = listProviders();
        setWalletProviders(wallets);

        async function enablePrevWallet() {
            // Check and enable previous session wallet if conditions meet.
            const storedWalletProvider = localStorage.getItem('wallet_provider');
            const storedWalletStakeAddress =
                localStorage.getItem('wallet_stake_address');
            const accessToken = Cookies.get('access_token');

            if (storedWalletProvider && storedWalletStakeAddress && accessToken) {
                const wallet = wallets.find(
                    (wallet) => wallet.name === storedWalletProvider
                );
                if (wallet) {
                    const enabledApi = await wallet.enable();
                    const rewardAddresses = await enabledApi.getRewardAddresses();
                    const walletStakeAddress =
                        rewardAddresses.length > 0 ? rewardAddresses[0] : null;

                    if (walletStakeAddress === storedWalletStakeAddress) {
                        setWalletApi(enabledApi);
                        setWalletStakeAddress(walletStakeAddress);
                    } else {
                        setWalletApi(null);
                        setAdminAcess(false);
                        Cookies.remove('access_token');
                        localStorage.removeItem('wallet_stake_address');
                        localStorage.removeItem('wallet_provider');
                    }
                }
            }
        }

        enablePrevWallet();
    }, []);

    const textHiglight = 'text-blue-500';
    return (
        <div>
            <Dialog open={refDialogOpen || dialogOpen}>
                <DialogContent
                    className="max-w-4xl px-8 pb-24  focus:outline-none"
                    defaultCross={false}
                >
                    <div className="flex flex-col gap-y-4 ">
                        <div className="mb-4 flex justify-end">
                            <X onClick={onClose} className="hover:cursor-pointer" />
                        </div>
                        <div className="mb-4 flex items-center justify-center gap-2">
                            <Wallet size={28} stroke="#2595FCFA" />
                            <span className="text-2xl font-semibold">
                                {' '}
                                Select your{' '}
                                <span className="text-blue-600">CIP-30</span> wallet
                                provider
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-x-4">
                            {walletProviders.length > 0 ? (
                                walletProviders.map((wallet: CIP30Provider, index) => (
                                    <div className="basix-1/4 disabled" key={index}>
                                        <WalletProviderDiv
                                            wallet={wallet}
                                            onClick={(wallet: CIP30Provider) =>
                                                currentSelectedWalletProvider === wallet
                                                    ? setCurrentSelectedWalletProvider(
                                                          null
                                                      )
                                                    : setCurrentSelectedWalletProvider(
                                                          wallet
                                                      )
                                            }
                                            selected={
                                                currentSelectedWalletProvider === wallet
                                            }
                                            disabled={connectingWallet}
                                        />
                                    </div>
                                ))
                            ) : (
                                <WalletProviderListEmptyMessage />
                            )}
                        </div>
                        <div className="mt-4 px-4 text-center">
                            By connecting your Wallet , you agree to the{' '}
                            <span className={textHiglight}>Terms & Conditons </span> and{' '}
                            <span className={textHiglight}>Privacy Policy.</span>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <Button
                                variant={'primary'}
                                size={'lg'}
                                className={cn(
                                    'without-focus-visible min-w-56 py-6 text-xl'
                                )}
                                onClick={() => {
                                    if (currentSelectedWalletProvider === null) return;
                                    enableWallet(currentSelectedWalletProvider);
                                }}
                                disabled={
                                    connectingWallet ||
                                    walletProviders.length === 0 ||
                                    currentSelectedWalletProvider === null
                                }
                            >
                                {connectingWallet ? 'Connecting...' : 'Use Wallet'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function WalletProviderDiv({
    wallet,
    onClick,
    selected,
    disabled = false
}: {
    wallet: CIP30Provider;
    onClick?: any;
    selected?: boolean;
    disabled?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex justify-center rounded-lg p-8 hover:cursor-pointer',
                selected
                    ? 'bg-[#35eae1] shadow-[0_20px_50px_rgba(53,_234,_225,_0.1)]'
                    : 'bg-gray-100 hover:bg-gray-200',
                disabled ? 'pointer-events-none opacity-60' : ''
            )}
            onClick={() => onClick?.(wallet)}
        >
            <Image src={wallet.icon} alt={wallet.name} width={48} height={48} />
        </div>
    );
}

const cip30walletsListLink = 'https://docs.muesliswap.com/cardano/cardano-wallets';

function WalletProviderListEmptyMessage() {
    return (
        <div className="h6 flex gap-2 rounded-lg bg-gray-100 p-8 text-gray-600">
            <OctagonAlert />
            <span>
                No Wallets found ! Click here to see a list of{' '}
                <Link
                    href={cip30walletsListLink}
                    target="_blank"
                    className="underline-offset-5 underline"
                >
                    CIP-30 Supported Wallets.{' '}
                </Link>
            </span>
        </div>
    );
}

'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SendLoginRequest } from '@api/auth';
import { getStakeAddress } from '@utils';
import { useAtom } from 'jotai';
import { CIP30Provider } from 'kuber-client/types';
import { OctagonAlert, Wallet } from 'lucide-react';
import { X } from 'lucide-react';

import { Dialog, DialogContent } from '@app/components/atoms/Dialog';
import { adminAccessAtom, currentConnectedWalletAtom } from '@app/store/localStore';
import { generateSignedData } from '@app/utils/auth';

import { Button } from '../atoms/Button';
import { cn } from '../lib/utils';
import { ErrorToast, SuccessToast } from '../molecules/CustomToasts';

declare global {
    interface Window {
        cardano: any;
    }
}

function listProviders(): CIP30Provider[] {
    const pluginMap = new Map();

    if (typeof window === 'undefined' || !window.cardano) {
        return [];
    }

    Object.keys(window.cardano).forEach((x) => {
        const plugin: CIP30Provider = window.cardano[x];

        if (plugin && typeof plugin.enable === 'function' && plugin.name) {
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
    const [, setCurrentConnectedWallet] = useAtom(currentConnectedWalletAtom);
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
            const enabledWalletApi = await wallet.enable();
            const signedData = await generateSignedData(enabledWalletApi);
            console.log(signedData);

            const response = await SendLoginRequest(signedData);

            if (response) {
                response.isSuperUser ? setAdminAcess(true) : setAdminAcess(false);
                const stakeAddress = await getStakeAddress(enabledWalletApi);

                setCurrentConnectedWallet({
                    api: enabledWalletApi,
                    provider: wallet.name,
                    /* Store address without netowrk prefix */
                    address: stakeAddress.slice(2, stakeAddress.length),
                    icon: wallet.icon
                });

                onComplete();
                setConnectingWallet(false);
                router.push('/');
            }
            if (!disabletoast) {
                setDialogOpen(false);
                SuccessToast('Wallet Connected!');
            }
        } catch (error: any) {
            ErrorToast('Unable to Sign In. Please try again');
            setConnectingWallet(false);
            setCurrentConnectedWallet(null);
        }
    }

    const textHiglight = 'text-blue-500';
    return (
        <div>
            <Dialog open={refDialogOpen || dialogOpen}>
                <DialogContent
                    className="w-full max-w-[90%] h-fit justify-self-end p-8 px-8 py-10 focus:outline-none sm:h-auto sm:w-auto sm:max-w-4xl sm:translate-y-[-50%] 2xl:py-12 rounded-2xl"
                    defaultCross={false}
                >
                    <div className="flex flex-col gap-y-4">
                        <X
                            onClick={onClose}
                            className="absolute right-4 top-4 hover:cursor-pointer"
                        />
                        <div className="mb-4 flex items-center justify-center gap-1 ">
                            <Wallet size={28} stroke="#2595FCFA"  className='hidden xl:flex '/>
                            <span className="text-xl font-semibold  2xl:text-2xl text-center ">
                                {' '}
                                Select your{' '}
                                <span className="text-blue-600">CIP-30</span> wallet
                                provider
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-x-4">
                            {listProviders().length > 0 ? (
                                listProviders().map((wallet: CIP30Provider, index) => (
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
                        <div className="mt-4 px-4 text-center text-sm 2xl:text-base ">
                            By connecting your Wallet , you agree to the{' '}
                            <span className={textHiglight}>Terms & Conditons </span> and{' '}
                            <span className={textHiglight}>Privacy Policy.</span>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <Button
                                variant={'primary'}
                                size={'md'}
                                className={cn(
                                    'without-focus-visible w-48 py-4 text-base 2xl:min-w-56 2xl:py-6 2xl:text-xl max-md:rounded-full'
                                )}
                                onClick={() => {
                                    if (currentSelectedWalletProvider === null) return;
                                    enableWallet(currentSelectedWalletProvider);
                                }}
                                disabled={
                                    connectingWallet ||
                                    listProviders().length === 0 ||
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
            <img src={wallet.icon} alt={wallet.name} width={48} height={48} />
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

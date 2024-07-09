'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useAtom } from 'jotai';
import { CIP30Provider } from 'kuber-client/types';
import { OctagonAlert, Wallet } from 'lucide-react';
import { X } from 'lucide-react';

import { Dialog, DialogContent } from '@app/components/atoms/Dialog';
import { walletApiAtom } from '@app/store/loaclStore';

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

export default function WalletSignInDialog() {
    //to do save to atom WalletAPI
    const [walletApi, setWalletApi] = useAtom(walletApiAtom);
    const [walletProviders, setWalletProviders] = useState<CIP30Provider[]>([]);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const [currentSelectedWalletProvider, setCurrentSelectedWalletProvider] =
        useState<CIP30Provider | null>(null);
    const [connectingWallet, setConnectingWallet] = useState<boolean>(false);

    async function enableWallet(wallet: CIP30Provider, disabletoast: boolean = false) {
        console.log(`Enabling ${wallet.name}`);
        setConnectingWallet(true);
        try {
            const enabledApi = await wallet.enable();
            setWalletApi(enabledApi);
            setDialogOpen(false);
            localStorage.setItem('wallet', wallet.name);
            if (!disabletoast) {
                SuccessToast(
                    'Wallet Connected Successfully! Redirecting you right now'
                );
            }
        } catch (error: any) {
            ErrorToast(error.info);
            setConnectingWallet(false);
            setDialogOpen(true);
            localStorage.removeItem('wallet');
        }
    }

    useEffect(() => {
        const wallets = listProviders();
        setWalletProviders(wallets);
        //Check and enable Wallet if previous Wallet is stored in Local Storage.
        const currentLocalWallet = localStorage.getItem('wallet');
        const prev_wallet = wallets.find(
            (wallet) => wallet.name === currentLocalWallet
        );
        prev_wallet ? enableWallet(prev_wallet, true) : setDialogOpen(true);
    }, []);

    useEffect(() => {
        console.log(walletApi);
    }, [walletApi]);

    //async function verifyWallet() {
    //  if (!walletApi) return;
    // const changeAddress = await walletApi.changeAddress();
    // const signature = await walletApi.signData(
    //   changeAddress.to_hex(),
    //   'hello world'
    //);
    //console.log(signature);
    // }

    function toggleDialog() {
        dialogOpen ? setDialogOpen(false) : setDialogOpen(true);
    }

    const textHiglight = 'text-blue-500';
    return (
        <div>
            <Dialog open={dialogOpen}>
                <DialogContent
                    className="max-w-4xl px-8 pb-24 focus:outline-none"
                    defaultCross={false}
                >
                    <div className="flex flex-col gap-y-4 ">
                        <div className="mb-4 flex justify-end">
                            <X
                                onClick={toggleDialog}
                                className="hover:cursor-pointer"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-center gap-2">
                            <Wallet size={28} stroke="#2595FCFA" />
                            <span className="text-2xl font-semibold">
                                {' '}
                                Connect your{' '}
                                <span className="text-blue-600">CIP-30</span> Wallet
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
                                className="without-focus-visible min-w-56 py-6 text-xl"
                                onClick={() => {
                                    if (currentSelectedWalletProvider === null) return;
                                    enableWallet(currentSelectedWalletProvider);
                                }}
                                disabled={
                                    connectingWallet || walletProviders.length === 0
                                }
                            >
                                {connectingWallet ? 'Connecting...' : 'Connect Wallet'}
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

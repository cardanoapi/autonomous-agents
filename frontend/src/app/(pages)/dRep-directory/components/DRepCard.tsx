'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAppDialog } from '@hooks';
import { DRepStatus, IDRepInternal } from '@models/types';
import { TypographyH2 } from '@typography';
import { convertLovelaceToAda, hexToBech32 } from '@utils';
import { CopyIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import AppDialog from '@app/app/components/AppDialog';
import AgentAvatar from '@app/components/Agent/shared/AgentAvatar';
import { Badge } from '@app/components/atoms/Badge';
import { Button } from '@app/components/atoms/Button';
import { cn } from '@app/components/lib/utils';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

import AgentsDelegationDialogContent from './AgentsDelegationDialogContent';
import DrepDetailDialogContent from './DrepDetailDialogContent';
import { useAtom } from 'jotai';
import { currentConnectedWalletAtom } from '@app/store/localStore';
import { Truncate } from '@app/utils/common/extra';

interface DRepCardProps {
    dRep: IDRepInternal;
}

export const getDrepGivedName = (drep: IDRepInternal) : string => {
    if (!drep.givenName) {
        return '';
    } else if (typeof drep.givenName === 'string') {
        return drep.givenName;
    } else {
        return drep.givenName['@value'] || '';
    }
};
const DRepCard: React.FC<DRepCardProps> = ({ dRep }) => {
    const { isOpen, toggleDialog } = useAppDialog();

    const [isDrepDetailsOpen, setIsDrepDetailsOpen] = useState(false);

    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom)

    const isDataMissing = dRep.givenName === undefined;

    const formattedVotingPower = useMemo(() => {
        return convertLovelaceToAda(dRep.votingPower).toLocaleString();
    }, [dRep.votingPower]);

    const handleCopyDRepId = () => {
        navigator.clipboard.writeText(hexToBech32(dRep.drepId));
        toast.success('Drep ID copied');
    };

    const handleCopyAgentId = () => {
        navigator.clipboard.writeText(dRep.agentId || '');
        toast.success('Agent ID copied');
    };

    function getBadgeVariant(status: string) {
        if (status === 'Active') return 'success';
        if (status === 'Inactive') return 'default';
        if (status === 'Retired') return 'outline';

        return 'default';
    }

    function toggleDrepDetailDialog() {
        setIsDrepDetailsOpen(!isDrepDetailsOpen);
    }

    function handleAgentRedirect() {
        router.push(`/agents/${dRep.agentId}`);
    }

    const router = useRouter();

    return (
        <>
            <div
                className={`shadow-xs flex w-full md:items-center md:justify-between rounded-lg border !border-none bg-white p-4 ${isDataMissing && 'shadow-bg-red-100 bg-red-100/40'} flex-col md:flex-row gap-y-4 items-start justify-start`}
            >
                <div className="flex space-x-0 md:space-x-4 sm:space-x-6 xl:space-x-12 2xl:space-x-10 4xl:space-x-20 flex-col md:flex-row gap-y-4 ">
                    <div className="flex flex-col space-y-2 ">
                        <div className={cn('flex')}>
                            {getDrepGivedName(dRep) !== '' && (
                                <TypographyH2 className={`mr-2 font-semibold`}>
                                    {Truncate(getDrepGivedName(dRep) , 25)}
                                </TypographyH2>
                            )}
                            <div className={"hidden md:block"}>
                                <Badge variant={getBadgeVariant(dRep.status)}>
                                    {dRep.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center text-brand-navy">
                            <p className="w-60 truncate text-sm font-medium 2xl:w-48 4xl:w-80">
                                DrepID : {hexToBech32(dRep.drepId)}
                            </p>
                            <CopyIcon
                                onClick={handleCopyDRepId}
                                className="ml-2 cursor-pointer"
                                size={20}
                            />
                        </div>
                    </div>
                    <div className={'flex gap-2 '}>
                        <div className={'flex flex-col md:flex-row'}>
                            <div className="flex w-32 flex-col md:items-center space-y-2 ">
                                <p className="text-sm text-gray-800">Voting Power</p>
                                <p className="font-semibold text-gray-600 text-sm md:text-base">
                                    ₳ {formattedVotingPower}
                                </p>
                            </div>
                        </div>
                        <hr className="border-b border-gray-200" />
                        <div className={'flex flex-col md:hidden'}>
                            <div className="flex w-32 flex-col md:items-center space-y-2  items-center justify-center">
                                <p className="text-sm text-gray-800 inline-flex">Status</p>
                                <Badge variant={getBadgeVariant(dRep.status)} className={'w-20'}>
                                    {dRep.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    {dRep.agentId && dRep.agentName && (
                        <AgentDetails
                            handleAgentRedirect={handleAgentRedirect}
                            agentId={dRep.agentId}
                            handleCopyAgentId={handleCopyAgentId}
                            agentName={dRep.agentName}
                        />
                    )}
                </div>
                <div className=" gap-2 hidden md:flex">
                <Button
                        className="rounded-3xl"
                        variant={'cool'}
                        onClick={() => setIsDrepDetailsOpen(!isDrepDetailsOpen)}
                    >
                        View details
                    </Button>
                    {dRep.status === DRepStatus.Active && currentConnectedWallet && (
                        <Button
                            onClick={toggleDialog}
                            className="rounded-3xl bg-brand-Blue-200 !px-6"
                            variant={'primary'}
                        >
                            Delegate
                        </Button>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <AppDialog isOpen={isOpen} toggleDialog={toggleDialog}>
                <AgentsDelegationDialogContent
                    dRepId={dRep.drepId}
                    handleClose={toggleDialog}
                />
            </AppDialog>

            <AppDialog isOpen={isDrepDetailsOpen} toggleDialog={toggleDrepDetailDialog}>
                <DrepDetailDialogContent dRep={dRep} onClose={toggleDrepDetailDialog} />
            </AppDialog>
        </>
    );
};

const AgentDetails = ({
    handleAgentRedirect,
    agentId,
    handleCopyAgentId,
    agentName
}: {
    handleAgentRedirect: any;
    agentId: string;
    agentName: any;
    handleCopyAgentId: any;
}) => {
    return (
        <div className="flex items-center justify-center gap-2">
            <div className="flex cursor-pointer" onClick={handleAgentRedirect}>
                <AgentAvatar
                    hash={agentId}
                    size={42}
                    activeStatus={false}
                    isActive={false}
                />
            </div>
            <div className="flex cursor-pointer flex-col space-y-2">
                <p className="text-sm font-medium text-gray-800">
                    <span
                        className="hover:text-brand-Blue-200"
                        onClick={handleAgentRedirect}
                    >
                        {' '}
                        {agentName || ''}
                    </span>
                </p>
                <div className="-2 flex">
                    <p className="w-44 truncate text-sm font-medium 2xl:w-48 4xl:w-80">
                        AgentID : {agentId || ''}
                    </p>
                    <CopyIcon
                        onClick={handleCopyAgentId}
                        className="ml-2 cursor-pointer "
                        size={20}
                    />
                </div>
            </div>
        </div>
    );
};

export const DRepCardSkeleton = ({
    internalDRep = true,
    className
}: {
    internalDRep?: boolean;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                'shadow-xs flex w-full items-center justify-between rounded-lg  bg-white p-4',
                className
            )}
        >
            <div className="flex space-x-4 sm:space-x-6  xl:space-x-12 2xl:space-x-10 4xl:space-x-20">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-36" />{' '}
                        {/* Placeholder for dRepName */}
                        <Skeleton className="h-5 w-16" /> {/* Placeholder for Badge */}
                    </div>
                    <div className="flex items-center text-brand-navy">
                        <Skeleton className="h-4 w-52 truncate text-sm font-medium 2xl:w-48 4xl:w-80" />{' '}
                        {/* Placeholder for dRepId */}
                        <Skeleton className="ml-2 h-5 w-5" />{' '}
                        {/* Placeholder for CopyIcon */}
                    </div>
                </div>
                <div>
                    <div className="flex w-32 flex-col items-center space-y-2">
                        <Skeleton className="h-4 w-24" />{' '}
                        {/* Placeholder for "Voting Power" label */}
                        <Skeleton className="h-5 w-20" />{' '}
                        {/* Placeholder for Voting Power value */}
                    </div>
                </div>
                {internalDRep && (
                    <div className="flex flex-col space-y-2">
                        <Skeleton className="h-4 w-36" />{' '}
                        {/* Placeholder for Agent Name */}
                        <div className="flex items-center">
                            <Skeleton className="h-4 w-44 truncate text-sm font-medium 2xl:w-48 4xl:w-80" />{' '}
                            {/* Placeholder for AgentID */}
                            <Skeleton className="ml-2 h-5 w-5" />{' '}
                            {/* Placeholder for CopyIcon */}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-3xl" />{' '}
                {/* Placeholder for View details button */}
                <Skeleton className="h-8 w-24 rounded-3xl" />{' '}
                {/* Placeholder for Delegate button */}
            </div>
        </div>
    );
};

export default DRepCard;

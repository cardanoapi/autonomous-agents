'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAppDialog } from '@hooks';
import { DRepStatus, IDRepInternal } from '@models/types';
import { TypographyH2 } from '@typography';
import { convertLovelaceToAda } from '@utils';
import { CopyIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import AppDialog from '@app/app/components/AppDialog';
import { Badge } from '@app/components/atoms/Badge';
import { Button } from '@app/components/atoms/Button';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';

import AgentsDelegationDialogContent from './AgentsDelegationDialogContent';
import DrepDetailDialogContent from './DrepDetailDialogContent';

interface DRepCardProps {
    dRep: IDRepInternal;
}

const DRepCard: React.FC<DRepCardProps> = ({ dRep }) => {
    const { isOpen, toggleDialog } = useAppDialog();

    const [isDrepDetialsOpen, setIsDrepDetialsOpen] = useState(false);

    const isDataMissing = dRep.dRepName === null || dRep.dRepName === undefined;

    const formattedVotingPower = useMemo(() => {
        return convertLovelaceToAda(dRep.votingPower).toLocaleString('en-Us');
    }, [dRep.votingPower]);

    const handleCopyDRepId = () => {
        navigator.clipboard.writeText(dRep.drepId);
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
        setIsDrepDetialsOpen(!isDrepDetialsOpen);
    }

    function handleAgentRedirect() {
        router.push(`/agents/${dRep.agentId}`);
    }

    const router = useRouter();

    return (
        <>
            <div
                className={`shadow-xs flex w-full items-center justify-between rounded-lg border !border-none bg-white p-4 ${isDataMissing && 'shadow-bg-red-100 bg-red-100/40'}`}
            >
                <div className="flex space-x-4 sm:space-x-6 lg:space-x-12 xl:space-x-20">
                    <div className="flex flex-col space-y-2">
                        <div className="flex gap-2">
                            <TypographyH2 className={`font-semibold ${isDataMissing}`}>
                                {isDataMissing ? 'Data Missing' : dRep.dRepName}
                            </TypographyH2>
                            <Badge variant={getBadgeVariant(dRep.status)}>
                                {dRep.status}
                            </Badge>
                        </div>
                        <div className="flex items-center text-brand-navy">
                            <p className="w-24 truncate text-sm font-medium xl:w-80">
                                DrepID : {dRep.drepId}
                            </p>
                            <CopyIcon
                                onClick={handleCopyDRepId}
                                className="ml-2 cursor-pointer"
                                size={20}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex w-32 flex-col items-center space-y-2">
                            <p className="text-sm text-gray-800">Voting Power</p>
                            <p className="font-semibold text-gray-600">
                                ₳ {formattedVotingPower}
                            </p>
                        </div>
                    </div>
                    {dRep.agentId && dRep.agentName && (
                        <div className="flex cursor-pointer flex-col space-y-2">
                            <p className="text-sm font-medium text-gray-800">
                                Agent Name:
                                <span
                                    className="hover:text-brand-Blue-200"
                                    onClick={handleAgentRedirect}
                                >
                                    {' '}
                                    {dRep.agentName || ''}
                                </span>
                            </p>
                            <div className="-2 flex">
                                <p className=" w-24 truncate text-ellipsis text-nowrap text-sm  xl:w-80 ">
                                    AgentID : {dRep.agentId || ''}
                                </p>
                                <CopyIcon
                                    onClick={handleCopyAgentId}
                                    className="ml-2 cursor-pointer "
                                    size={20}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        className="rounded-3xl"
                        variant={'cool'}
                        onClick={() => setIsDrepDetialsOpen(!isDrepDetialsOpen)}
                    >
                        View details
                    </Button>
                    {dRep.status === DRepStatus.Active && (
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

            <AppDialog isOpen={isDrepDetialsOpen} toggleDialog={toggleDrepDetailDialog}>
                <DrepDetailDialogContent dRep={dRep} />
            </AppDialog>
        </>
    );
};

export const DRepCardSkeleton = () => {
    return (
        <div className="shadow-xs flex w-full items-center justify-between rounded-lg  bg-white p-4">
            <div className="flex space-x-4 sm:space-x-6 lg:space-x-12 xl:space-x-20">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-36" />{' '}
                        {/* Placeholder for dRepName */}
                        <Skeleton className="h-5 w-16" /> {/* Placeholder for Badge */}
                    </div>
                    <div className="flex items-center text-brand-navy">
                        <Skeleton className="h-4 w-48 xl:w-80" />{' '}
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
                <div className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-36" /> {/* Placeholder for Agent Name */}
                    <div className="flex items-center">
                        <Skeleton className="h-4 w-48 xl:w-80" />{' '}
                        {/* Placeholder for AgentID */}
                        <Skeleton className="ml-2 h-5 w-5" />{' '}
                        {/* Placeholder for CopyIcon */}
                    </div>
                </div>
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

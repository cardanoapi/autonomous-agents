'use client';

import { useMemo } from 'react';

import { useAppDialog } from '@hooks';
import { DRepStatus, IDRep } from '@models/types';
import { TypographyH2 } from '@typography';
import { convertLovelaceToAda } from '@utils';
import { CopyIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import AppDialog from '@app/app/components/AppDialog';
import { Badge } from '@app/components/atoms/Badge';
import { Button } from '@app/components/atoms/Button';
import { cn } from '@app/components/lib/utils';

import AgentsDelegationDialogContent from './AgentsDelegationDialogContent';

const statusColor: Record<DRepStatus, string> = {
    Active: '!bg-green-600',
    Inactive: '!bg-red-600',
    Retired: '!bg-slate-600',
    Yourself: '!bg-blue-600'
};

interface DRepCardProps {
    dRep: IDRep;
}

const DRepCard: React.FC<DRepCardProps> = ({ dRep }) => {
    const { isOpen, toggleDialog } = useAppDialog();

    const isDataMissing = dRep.dRepName === null;

    const formattedVotingPower = useMemo(() => {
        return convertLovelaceToAda(dRep.votingPower).toLocaleString('en-Us');
    }, [dRep.votingPower]);

    const handleCopyDRepId = () => {
        navigator.clipboard.writeText(dRep.drepId);
        toast.success('Copied to clipboard');
    };

    return (
        <>
            <div
                className={`shadow-xs flex w-full items-center justify-between rounded-lg border !border-none bg-white p-4 ${isDataMissing && 'shadow-bg-red-100 bg-red-100/40'}`}
            >
                <div className="flex space-x-4 sm:space-x-6 lg:space-x-12 xl:space-x-20">
                    <div className="flex flex-col space-y-2">
                        <TypographyH2
                            className={`font-semibold ${isDataMissing && 'text-red-500'}`}
                        >
                            {isDataMissing ? 'Data Missing' : dRep.dRepName}
                        </TypographyH2>
                        <div className="flex items-center text-brand-navy">
                            <p className="w-24 truncate text-sm font-medium xl:w-80">
                                {dRep.drepId}
                            </p>
                            <CopyIcon
                                onClick={handleCopyDRepId}
                                className="ml-2 cursor-pointer"
                                size={20}
                            />
                        </div>
                    </div>

                    <div className="flex w-32 flex-col items-center space-y-2">
                        <p className="text-sm text-gray-800">Voting Power</p>
                        <p className="font-semibold text-gray-600">
                            ₳ {formattedVotingPower}
                        </p>
                    </div>

                    <div className="flex w-32 flex-col items-center space-y-2">
                        <p className="text-sm text-gray-800">Status</p>
                        <Badge
                            className={cn(
                                statusColor[dRep.status],
                                'flex min-w-20 justify-center py-[6px] !text-white'
                            )}
                            variant="default"
                        >
                            {dRep.status}
                        </Badge>
                    </div>
                </div>

                {dRep.status === DRepStatus.Active && (
                    <Button
                        onClick={toggleDialog}
                        className="rounded-3xl bg-brand-Blue-200"
                        variant={'primary'}
                    >
                        Delegate
                    </Button>
                )}
            </div>

            {/* Dialogs */}
            <AppDialog isOpen={isOpen} toggleDialog={toggleDialog}>
                <AgentsDelegationDialogContent
                    dRepId={dRep.drepId}
                    handleClose={toggleDialog}
                />
            </AppDialog>
        </>
    );
};

export default DRepCard;

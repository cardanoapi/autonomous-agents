import { useRouter } from 'next/navigation';

import { useAppDialog } from '@hooks';
import { GovernanceActionFilter, IProposalInternal } from '@models/types/proposal';
import { Typography } from '@mui/material';
import { CopyIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import AppDialog from '@app/app/components/AppDialog';
import { Button } from '@app/components/atoms/Button';
import { cn } from '@app/components/lib/utils';
import { Skeleton } from '@app/components/shadcn/ui/skeleton';
import { formatDisplayDate } from '@app/utils/dateAndTimeUtils';

import AgentsVoteDialogContent from './AgentsVoteDialogContent';

interface ProposalCardProps {
    proposal: IProposalInternal;
}
const formatProposalType = (type: string) => {
    const proposalFilterKeys = Object.keys(GovernanceActionFilter);
    const proposalFilterValue = Object.values(GovernanceActionFilter);
    const title = proposalFilterValue[proposalFilterKeys.indexOf(type)] ?? type;

    return title || type;
};
const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
    const { isOpen, toggleDialog } = useAppDialog();
    const isDataMissing = proposal.title === null;
    const proposalId = `${proposal.txHash}#${proposal.index}`;

    const handleCopyGovernanceActionId = () => {
        navigator.clipboard.writeText(proposalId);
        toast.success('Proposal ID Copied');
    };

    const handleCopyAgentId = () => {
        navigator.clipboard.writeText(proposal.agentId);
        toast.success('Agent ID Copied');
    };

    const router = useRouter();

    const handleAgentRedirect = () => {
        router.push(`/agents/${proposal.agentId}`);
    };

    return (
        <>
            <div className="flex w-full flex-col justify-between bg-transparent">
                <div
                    className={`flex h-full w-full flex-col gap-5 rounded-t-xl  ${isDataMissing ? 'shadow-bg-red-100 bg-red-100/40' : 'bg-brand-White-200'}  px-6 pb-6 pt-10`}
                >
                    <p
                        className={`line-clamp-2 text-[18px]  font-semibold leading-[24px] ${isDataMissing && 'text-red-600'}`}
                    >
                        {isDataMissing ? 'Data Missing' : proposal.title}
                    </p>
                    {proposal.abstract !== null && (
                        <div className="flex flex-col gap-1">
                            <p className="  text-xs font-medium  text-brand-Gray-50">
                                Abstract
                            </p>
                            <p className="line-clamp-2 text-sm text-brand-Black-300">
                                {proposal.abstract}
                            </p>
                        </div>
                    )}
                    <div
                        className={cn(
                            proposal.agentName
                                ? 'rounded-lg border border-gray-200 p-4 shadow-sm'
                                : ''
                        )}
                    >
                        <div className="flex flex-col gap-2">
                            {proposal.agentName && (
                                <p className="cursor-pointer text-sm font-semibold text-gray-700">
                                    Agent Name :{' '}
                                    <span
                                        className="hover:text-brand-Blue-200"
                                        onClick={handleAgentRedirect}
                                    >
                                        {proposal.agentName}
                                    </span>
                                </p>
                            )}

                            {proposal.agentId && (
                                <div className="flex justify-between ">
                                    <p className="inline-flex w-[90%] text-sm text-gray-600">
                                        <span className="overflow-hidden text-ellipsis text-nowrap">
                                            Agent ID: {proposal.agentId}
                                        </span>
                                    </p>
                                    <CopyIcon size={20} onClick={handleCopyAgentId} />
                                </div>
                            )}

                            <p className="mt-2 text-xs font-medium text-gray-500">
                                Governance Action Type
                            </p>

                            <div className="mt-1 flex gap-2">
                                <span className="rounded-full bg-blue-100 px-4 py-1 text-xs text-blue-700">
                                    {formatProposalType(proposal.type)}
                                </span>

                                {proposal.agentId && proposal.agentName && (
                                    <span className="rounded-full bg-blue-100 px-4 py-1 text-xs text-blue-700">
                                        Internal Proposal
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-brand-lightBlue text-xs ">
                        <div className="space-x-1 bg-brand-lightBlue bg-opacity-50 py-[6px] text-center ">
                            <span>Submitted:</span>
                            <span className="font-medium">
                                {formatDisplayDate(proposal.createdDate)}
                            </span>
                            <span>(Epoch {proposal.createdEpochNo})</span>
                        </div>
                        <p className="space-x-1 py-[6px] text-center">
                            <span>Expires:</span>
                            <span className="font-medium">
                                {formatDisplayDate(proposal.expiryDate)}
                            </span>
                            <span>(Epoch {proposal.expiryEpochNo})</span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-[#8E908E]">
                            Governance Action Id
                        </p>
                        <div className="flex justify-between gap-2 text-brand-primaryBlue">
                            <Typography className="text-sm" noWrap>
                                {proposalId}
                            </Typography>
                            <div
                                onClick={handleCopyGovernanceActionId}
                                className="cursor-pointer"
                            >
                                <CopyIcon className="h-5 w-5 " />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex w-full rounded-b-2xl bg-white p-6">
                    <Button
                        onClick={toggleDialog}
                        className="w-full rounded-[100px]"
                        variant={'primary'}
                    >
                        Vote
                    </Button>
                </div>
            </div>
            {/* Dialogs */}
            <AppDialog isOpen={isOpen} toggleDialog={toggleDialog}>
                <AgentsVoteDialogContent
                    handleClose={toggleDialog}
                    proposalId={proposalId}
                />
            </AppDialog>
        </>
    );
};

export default ProposalCard;

export const ProposalCardSkeleton: React.FC = () => {
    return (
        <div className="flex w-full flex-col justify-between bg-transparent">
            <div className="flex h-full w-full flex-col gap-5 rounded-t-xl bg-brand-White-200 px-6 pb-6 pt-10">
                {/* Title Skeleton */}
                <Skeleton className="h-6 w-3/4 rounded" />

                {/* Abstract Skeleton */}
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-1/4 rounded" />
                    <Skeleton className="h-5 w-full rounded" />
                </div>

                {/* Agent Details Skeleton */}
                <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-5 w-1/2 rounded" />
                        <Skeleton className="h-5 w-full rounded" />
                    </div>
                </div>

                {/* Date Section Skeleton */}
                <div className="rounded-xl border border-brand-lightBlue text-xs">
                    <div className="space-x-1 bg-brand-lightBlue bg-opacity-50 py-[6px] text-center">
                        <Skeleton className="h-4 w-1/4 rounded" />
                    </div>
                    <div className="space-x-1 py-[6px] text-center">
                        <Skeleton className="h-4 w-1/4 rounded" />
                    </div>
                </div>

                {/* Governance Action Id Skeleton */}
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <div className="flex justify-between gap-2">
                        <Skeleton className="h-5 w-3/4 rounded" />
                        <Skeleton className="h-5 w-5 rounded" />
                    </div>
                </div>
            </div>

            {/* Button Skeleton */}
            <div className="flex w-full rounded-b-2xl bg-white p-6">
                <Skeleton className="h-10 w-full rounded-[100px]" />
            </div>
        </div>
    );
};

import { useAppDialog } from '@hooks';
import { GovernanceActionFilter, IProposal } from '@models/types/proposal';
import { Typography } from '@mui/material';
import { CopyIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import AppDialog from '@app/app/components/AppDialog';
import { Button } from '@app/components/atoms/Button';
import { formatDisplayDate } from '@app/utils/dateAndTimeUtils';

import AgentsVoteDialogContent from './AgentsVoteDialogContent';

interface ProposalCardProps {
    proposal: IProposal;
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
        toast.success('Copied to clipboard');
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
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-brand-Gray-50">
                            Governance Action Type
                        </p>
                        <p className=" w-fit rounded-[100px] bg-brand-lightBlue px-[18px] py-[6px] text-xs  text-brand-Black-300">
                            {formatProposalType(proposal.type)}
                        </p>
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

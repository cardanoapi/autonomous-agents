import { IProposal } from '@models/types/proposal';
import { Typography } from '@mui/material';
import { CopyIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@app/components/atoms/Button';

interface ProposalCardProps {
    proposal: IProposal;
}
const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
    const handleCopyGovernanceActionId = () => {
        navigator.clipboard.writeText(`${proposal.txHash}#${proposal.index}`);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="boxShadow mb-10 flex w-full max-w-[350px] flex-col justify-between rounded-[20px] ">
            <div className=" flex h-full w-full flex-col gap-5 rounded-t-[20px] bg-brand-White-200  px-6 pb-6 pt-10">
                <p className="line-clamp-2 text-[18px]  font-semibold leading-[24px]">
                    {proposal.title}
                </p>
                <div className="flex flex-col gap-1">
                    <p className=" text- text-brand-Gray-50 text-[12px] font-medium leading-[16px]">
                        Abstract
                    </p>
                    <p className="line-clamp-2 text-[14px] leading-[20px] text-brand-Black-300">
                        {proposal.abstract}
                    </p>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-brand-Gray-50 text-xs font-medium">
                        Governance Action Type
                    </p>
                    <p className="bg-brand-lightBlue w-min rounded-[100px] px-[18px] py-[6px] text-xs text-brand-Black-300">
                        {proposal.type}
                    </p>
                </div>

                <div className="border-brand-lightBlue rounded-xl border text-xs ">
                    <p className="bg-brand-lightBlue bg-opacity-50 py-[6px] text-center opacity-50">
                        Submitted:
                        <span className="font-medium"> {proposal.createdDate}</span>
                    </p>
                    <p className="py-[6px] text-center">
                        Expires:
                        <span className="font-medium"> {proposal.expiryDate}</span>
                    </p>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-[#8E908E]">
                        Governance Action Id
                    </p>
                    <div className="text-brand-primaryBlue flex justify-between gap-2">
                        <Typography className="text-sm" noWrap>
                            {proposal.txHash}#{proposal.index}
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
            <div className="flex w-full rounded-b-[20px] bg-white p-6">
                <Button className="bg-brand-primaryBlue w-full rounded-[100px]">
                    Vote
                </Button>
            </div>
        </div>
    );
};

export default ProposalCard;

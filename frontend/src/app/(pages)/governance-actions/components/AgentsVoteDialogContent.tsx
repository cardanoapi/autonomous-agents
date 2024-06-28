import AgentsActionDialogContent from '@app/app/components/AgentActionDialogContent';

interface AgentsVoteDialogContentProps {
    handleClose: () => void;
    proposalId: string;
}

const AgentsVoteDialogContent = ({
    handleClose,
    proposalId
}: AgentsVoteDialogContentProps) => {
    return (
        <AgentsActionDialogContent
            title="Vote on Proposal"
            description="Select agents for vote."
            handleClose={handleClose}
            triggerType={'Vote'}
            functionId={proposalId}
        />
    );
};

export default AgentsVoteDialogContent;

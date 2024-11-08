import AgentsActionDialogContent from "@app/components/molecules/AgentActionDialogContent";

interface AgentsDelegationDialogContentProps {
    dRepId: string;
    handleClose: () => void;
}

export default function AgentsDelegationDialogContent({
    dRepId,
    handleClose
}: AgentsDelegationDialogContentProps) {
    return (
        <AgentsActionDialogContent
            title="Delegate to DRep"
            description="Select agents for delegation."
            handleClose={handleClose}
            triggerType={'delegation'}
            functionId={dRepId}
        />
    );
}

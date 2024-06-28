import { isEmpty } from 'lodash';

import { AgentTriggerFunctionType } from '@models/types';
import { CircularProgress } from '@mui/material';

import { AppDialogContent } from '@app/app/components/AppDialog';
import Loader from '@app/app/components/Loader';
import { Button } from '@app/components/atoms/Button';
import { useAgentsAction } from '@app/lib/hooks/useAgentActions';

import AgentSelector from './AgentSelector';
import EmptyAgent from './EmptyAgent';

interface AgentsActionDialogContentProps {
    title: string;
    description: string;
    handleClose: () => void;
    triggerType: AgentTriggerFunctionType;
    functionId: string;
}

const AgentsActionDialogContent = ({
    title,
    description,
    handleClose,
    triggerType,
    functionId
}: AgentsActionDialogContentProps) => {
    const {
        activeAgents,
        isLoading,
        isSubmitting,
        handleSelect,
        handleAction,
        selectedAgentIds
    } = useAgentsAction(triggerType, handleClose, functionId);

    if (isLoading) return <Loader />;

    return (
        <AppDialogContent title={title} description={description}>
            <div className="space-y-2' flex w-full flex-col">
                {activeAgents.length === 0 ? (
                    <EmptyAgent />
                ) : (
                    <div className="flex flex-col gap-2">
                        {activeAgents.map((agent) => (
                            <AgentSelector
                                key={agent.id}
                                agent={agent}
                                handleSelect={handleSelect}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Button
                onClick={handleAction}
                disabled={isEmpty(selectedAgentIds)}
                className="mt-6 w-full rounded-3xl bg-brand-primaryBlue hover:bg-brand-navy hover:shadow-lg"
            >
                {isSubmitting ? <CircularProgress className="h-5 w-5" /> : 'Continue'}
            </Button>
        </AppDialogContent>
    );
};

export default AgentsActionDialogContent;

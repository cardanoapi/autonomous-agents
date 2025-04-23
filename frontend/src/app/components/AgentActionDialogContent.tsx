import { isEmpty } from 'lodash';

import { IAgent } from '@api/agents';
import { AgentTriggerFunctionType } from '@models/types';
import { CircularProgress } from '@mui/material';
import { useAtom } from 'jotai';

import { AppDialogContent } from '@app/app/components/AppDialog';
import { Button } from '@app/components/atoms/Button';
import { useAgentsAction } from '@app/lib/hooks/useAgentActions';
import { adminAccessAtom, currentConnectedWalletAtom } from '@app/store/localStore';

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
    const { activeAgents, isSubmitting, handleSelect, handleAction, selectedAgentIds } = useAgentsAction(
        triggerType,
        handleClose,
        functionId
    );

    const [adminAccess] = useAtom(adminAccessAtom);
    const [currentConnectedWallet] = useAtom(currentConnectedWalletAtom);

    function filterUserOwnedAgents(agents: IAgent[]) {
        return adminAccess ? agents : agents.filter((agent) => agent.userAddress === currentConnectedWallet?.address);
    }

    const userOwnedAgents = filterUserOwnedAgents(activeAgents);

    return (
        <AppDialogContent title={title} description={description} onClose={handleClose}>
            <div className="space-y-2' flex w-full flex-col">
                {userOwnedAgents.length === 0 ? (
                    <EmptyAgent />
                ) : (
                    <div className="flex flex-col gap-2">
                        {userOwnedAgents.map((agent) => (
                            <AgentSelector key={agent.id} agent={agent} handleSelect={handleSelect} />
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

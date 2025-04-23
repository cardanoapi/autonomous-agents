import { useState } from 'react';

import { IAgent } from '@api/agents';

import { Checkbox } from '@app/components/atoms/Checkbox';
import { CustomCombobox } from '@app/components/molecules/CustomCombobox';
import { IAgentVote, VoteType } from '@app/lib/hooks/useAgentActions';

interface AgentSelectorProps {
    agent: IAgent;
    handleSelect: (checked: string | boolean, agent: IAgentVote) => void;
}

export default function AgentSelector({ agent, handleSelect }: AgentSelectorProps) {
    const [voteType, setVoteType] = useState('');
    const voteTypes = [
        { id: 'Yes', label: 'Yes' },
        { id: 'No', label: 'No' },
        { id: 'Abstain', label: 'Abstain' }
    ];
    const handleCheckChange = (checked: string | boolean) => {
        handleSelect(checked, {
            agentId: agent.id,
            voteType: voteType as VoteType
        });
    };
    return (
        <div className="flex items-center gap-4 rounded-lg border p-2 hover:bg-gray-200/90">
            <Checkbox
                disabled={!voteTypes.some((vote) => vote.id === voteType)}
                onCheckedChange={(checked) => handleCheckChange(checked)}
            />
            <div className="flex w-full flex-row justify-between gap-4">
                <p className=" text-sm font-medium">{agent.name}</p>
                <div className={'flex flex-row gap-2'}>
                    <span>Vote :</span>
                    <CustomCombobox
                        defaultValue={{ id: 'Select Voting Options', label: 'Select Voting Options' }}
                        className={'w-[250px] border-0'}
                        itemsList={voteTypes}
                        onSelect={(voteType: string) => setVoteType(voteType)}
                    />
                </div>
            </div>
        </div>
    );
}

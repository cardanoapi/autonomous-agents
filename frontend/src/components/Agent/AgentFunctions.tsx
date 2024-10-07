import { useState } from 'react';

import { IAgent } from '@api/agents';
import { IAgentConfiguration } from '@api/agents';
import { ScrollArea } from '@radix-ui/react-scroll-area';

import { Button } from '../atoms/Button';
import TextDisplayField from '../molecules/TextDisplayField';
import AgentFunctionsDetailComponent from './AgentFunctionsDetail';

export default function AgentFunctionsComponent({
    agent
}: {
    agent: IAgent | null | undefined;
}) {
    const [agentConfigurations, setAgentConfigurations] = useState<
        Array<IAgentConfiguration>
    >(agent?.agent_configurations || []);

    return (
        <div className="flex h-full flex-col gap-10">
            <div className="flex flex-col gap-4">
                <div className="flex w-full items-center justify-between">
                    <TextDisplayField
                        title="Agent Name"
                        content={'Saved Functions'}
                        textClassName="text-xl font-semibold"
                    />
                    <Button
                        variant="primary"
                        onClick={() => null}
                        size="sm"
                        className="min-w-32 px-4"
                    >
                        Add Function
                    </Button>
                </div>
                <ScrollArea className="w-full overflow-y-auto px-2">
                    <AgentFunctionsDetailComponent
                        agentConfigurations={agentConfigurations}
                    />
                </ScrollArea>
            </div>
        </div>
    );
}

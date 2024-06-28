import { IAgent } from '@api/agents';
import { ITemplate, fetchTemplatebyID } from '@api/templates';
import { useQuery } from '@tanstack/react-query';

import { Checkbox } from '@app/components/atoms/Checkbox';

interface AgentSelectorProps {
    agent: IAgent;
    handleSelect: (checked: string | boolean, agent: IAgent) => void;
}
export default function AgentSelector({ agent, handleSelect }: AgentSelectorProps) {
    const { data: template } = useQuery<ITemplate>({
        queryKey: [`template${agent.template_id}`],
        queryFn: () => fetchTemplatebyID(agent.template_id)
    });
    return (
        <div className="flex items-center gap-4 rounded-lg border p-2 ">
            <Checkbox onCheckedChange={(checked) => handleSelect(checked, agent)} />
            <div className="flex flex-col ">
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="text-xs text-gray-600">{template?.name}</p>
            </div>
        </div>
    );
}

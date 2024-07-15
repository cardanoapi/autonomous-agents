import { useQuery } from '@tanstack/react-query';

import { IAgent } from '@app/app/api/agents';
import { IFunction, fetchFunctions } from '@app/app/api/functions';
import AgentFunctionCard from '@app/components/Agent/AgentFunctionCard';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';

const AgentManualTriggerComponent = ({ agent }: { agent?: IAgent }) => {
    const { data } = useQuery<Record<string, IFunction[]>>({
        queryKey: ['functions'],
        queryFn: fetchFunctions
    });
    const functions = data && Object.entries(data);
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Manual Trigger</span>
            </div>
            <span>Available functions:</span>
            <ScrollArea className={'w-full overflow-y-auto pr-4'}>
                <div className={'flex flex-col gap-10'}>
                    {functions &&
                        functions?.map((func: [string, IFunction[]], index: number) => {
                            return (
                                <div key={index} className={'flex flex-col gap-4'}>
                                    <span className={'font-medium'}>{func[0]}</span>
                                    <div className={'flex flex-row gap-4'}>
                                        {func[1].map((f: IFunction) => {
                                            return (
                                                <AgentFunctionCard
                                                    key={f.function_name}
                                                    func={f}
                                                    agentId={agent?.id || ''}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </ScrollArea>
        </div>
    );
};

export default AgentManualTriggerComponent;

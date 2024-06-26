import { useQuery } from '@tanstack/react-query';

import { IAgent } from '@app/app/api/agents';
import { IFunction, fetchFunctions } from '@app/app/api/functions';
import AgentFunctionCard from '@app/components/Agent/AgentFunctionCard';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { ScrollArea } from '@app/components/shadcn/ui/scroll-area';

const AgentManualTriggerComponent = ({ agent }: { agent?: IAgent }) => {
    const { data: functions } = useQuery<IFunction[]>({
        queryKey: ['functions'],
        queryFn: fetchFunctions
    });
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Manual Trigger</span>
            </div>
            <span>Available functions:</span>
            <ScrollArea className={'w-full overflow-y-auto pr-4'}>
                <div
                    className={
                        'grid h-full w-full grid-cols-1 gap-4 py-4 md:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4'
                    }
                >
                    {functions &&
                        functions.map((func: IFunction) => {
                            return (
                                <AgentFunctionCard
                                    key={func.function_name}
                                    func={func}
                                    agentId={agent?.id || ''}
                                />
                            );
                        })}
                </div>
            </ScrollArea>
        </div>
    );
};

export default AgentManualTriggerComponent;

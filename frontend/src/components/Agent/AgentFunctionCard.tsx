import { IFunction } from '@app/app/api/functions';
import { useModal } from '@app/components/Modals/context';

const AgentFunctionCard = ({ func, agentId }: { func: IFunction; agentId: string }) => {
    const { openModal } = useModal();
    const handleClick = () => {
        openModal('AgentManualTriggerView', { agentFunction: func, agentId });
    };
    return (
        <div
            onClick={handleClick}
            className={
                'flex h-[130px] w-full cursor-pointer flex-col gap-2 rounded-md bg-gray-100 px-3 py-2 drop-shadow-md hover:bg-gray-200 lg:w-[300px]'
            }
        >
            <span className={'text-base'}>{func.name}</span>
            <span className={'text-xs text-brand-Black-300/80'}>
                {func?.description || 'No Description'}
            </span>
        </div>
    );
};

export default AgentFunctionCard;

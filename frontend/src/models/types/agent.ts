export type AgentTriggerFunctionType = 'Delegation' | 'Vote';

interface IParamater {
    name: string;
    description: string;
    optional: boolean;
    data_type: string;
    value?: string;
}
export interface IAgentTrigger {
    function_name: AgentTriggerFunctionType;
    parameters: IParamater[];
}

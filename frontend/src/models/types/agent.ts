export type AgentTriggerFunctionType =
    | 'Delegation'
    | 'Vote'
    | 'SendAda Token'
    | 'Proposal New Constitution'
    | 'Info Action Proposal';

interface IParamater {
    name: string;
    description: string;
    optional: boolean;
    data_type: string;
    value?: string;
}
export interface IAgentTrigger {
    function_name: AgentTriggerFunctionType;
    parameters?: IParamater[];
    parameter: IParamater[];
}

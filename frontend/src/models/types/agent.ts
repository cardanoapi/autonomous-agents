export type AgentTriggerFunctionType =
    | 'voteOnProposal'
    | 'transferADA'
    | 'stakeDelegation'
    | 'createInfoGovAction'
    | 'proposalNewConstitution';

interface IParameter {
    name: string;
    description: string;
    optional: boolean;
    data_type: string;
    value?: string;
}
export interface IAgentTrigger {
    function_name: AgentTriggerFunctionType;
    parameters: IParameter[];
}

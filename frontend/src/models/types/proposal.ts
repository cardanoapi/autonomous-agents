export interface IProposal {
    proposal: {
        type: string;
        details: any;
        metadataUrl: string;
        metadataHash: string;
    };
    meta: {
        protocolParams: any | null;
        title: string | null;
        abstract: string | null;
        motivation: string | null;
        rationale: string | null;
    };
    createdAt: {
        time: string;
        block: number;
        blockHash: string;
        epoch: number;
        slot: number;
        tx: string;
        index: number;
    };
    expireAt: {
        time: string;
        epoch: number;
    };
    status: string | null;
}

export enum ProposalListSort {
    SonnestToExpire = 'SoonestToExpire',
    NewestCreated = 'NewestCreated',
    Status = 'MostYesVotes'
}

export enum GovernanceActionFilter {
    NoConfidence = 'No Confidence',
    NewCommittee = 'New Committe',
    NewConstitution = 'Update to the Constitution',
    HardForkInitiation = 'Hard Fork',
    ParameterChange = 'Protocol Parameter Change',
    TreasuryWithdrawals = 'Treasury Withdrawal',
    InfoAction = 'Info Action'
}

/* This interface is an extension of IProposal. It adds the agentId and agentName for potential internal proposals. Use this instead */
export interface IProposalInternal extends IProposal {
    agentId: string;
    agentName: string;
}

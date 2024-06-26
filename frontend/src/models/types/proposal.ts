export interface IProposal {
    id: string;
    txHash: string;
    index: number;
    type: string;
    details: any;
    expiryDate: string;
    expiryEpochNo: number;
    createdDate: string;
    createdEpochNo: number;
    url: string;
    metadataHash: string;
    title: string | null;
    abstract: string | null;
    motivation: string | null;
    rationale: string | null;
    metadata: any;
    references: string[];
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    metadataStatus: null | string;
    metadataValid: boolean;
}

export enum ProposalListSort {
    SonnestToExpire = 'SoonestToExpire',
    NewestCreated = 'NewestCreated',
    Status = 'MostYesVotes'
}

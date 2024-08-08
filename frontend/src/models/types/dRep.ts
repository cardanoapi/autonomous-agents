export enum DRepStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Retired = 'Retired',
    Yourself = 'Yourself'
}

export enum DRepListSort {
    VotingPower = 'VotingPower',
    RegistrationDate = 'RegistrationDate',
    Status = 'Status'
}

export interface IDRep {
    drepId: string;
    view: string;
    url: string;
    metadataHash: string;
    deposit: number;
    votingPower: number;
    status: DRepStatus;
    type: 'DRep' | 'SoleVoter';
    bio: string;
    dRepName?: string;
    email?: string;
    references: string[];
    metadataValid: boolean;
}
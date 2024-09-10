import { IProposalInternal } from '@models/types/proposal';

import { baseAPIurl } from './config';

interface IProposalResponse {
    items: IProposalInternal[];
    total: number;
    page: number;
    pageSize: number;
}

// Modify fetchProposals to accept parameters
export const fetchProposals = async (params: {
    page: number;
    pageSize: number;
    proposal_type: string;
    sort: string;
}): Promise<IProposalResponse> => {
    const { page, pageSize, proposal_type, sort } = params;
    const queryString = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        proposal_type: proposal_type,
        sort
    }).toString();

    const res = await fetch(`${baseAPIurl}/proposals?${queryString}`);
    if (!res.ok) {
        throw new Error('Proposals Fetch Operation failed: Network Error');
    }
    return await res.json();
};

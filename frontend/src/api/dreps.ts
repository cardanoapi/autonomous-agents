import { IDRepInternal } from '@models/types';

import { baseAPIurl } from './config';

interface IDrepResponse {
    items: IDRepInternal[];
    total: number;
    page: number;
    pageSize: number;
}

// Modify fetchProposals to accept parameters
export const fetchDreps = async (params: {
    page: number;
    pageSize: number;
    drep_type: string;
    search: string;
}): Promise<IDrepResponse> => {
    const { page, pageSize, drep_type, search } = params;
    const queryString = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        drep_type: drep_type,
        search: search
    }).toString();

    const res = await fetch(`${baseAPIurl}/dreps?${queryString}`);
    if (!res.ok) {
        throw new Error('Proposals Fetch Operation failed: Network Error');
    }
    return await res.json();
};

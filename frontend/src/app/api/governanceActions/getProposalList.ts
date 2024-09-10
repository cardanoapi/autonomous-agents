import { ENVIRONMENTS } from '@configs';
import { IProposal, ProposalListSort } from '@models/types/proposal';

import axiosClient from '@app/utils/axios';

axiosClient.defaults.baseURL = `${ENVIRONMENTS.GOVTOOL_BASE_URL}/api`;

export type GetproposalListArgs = {
    filters?: string[];
    page?: number;
    pageSize?: number;
    sorting?: ProposalListSort;
    dRepId?: string;
    searchPhrase?: string;
};

export interface ProposalResponse {
    page: number;
    pageSize: number;
    total: number;
    items: IProposal[];
}

export const getProposalList = async ({
    sorting,
    filters = [],
    page = 0,
    pageSize = 10,
    searchPhrase = '',
    dRepId
}: GetproposalListArgs): Promise<ProposalResponse> => {
    const response = await axiosClient.get('/proposal/list', {
        params: {
            page,
            pageSize,
            ...(searchPhrase && { search: searchPhrase }),
            ...(filters.length && { type: filters }),
            ...(sorting && { sort: sorting }),
            ...(dRepId && { drepId: dRepId })
        }
    });
    return response.data;
};

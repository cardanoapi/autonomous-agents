import { ENVIRONMENTS } from '@configs';
import { useQuery } from '@tanstack/react-query';

import { DRepListSort, DRepStatus, IDRep } from '@app/models/types';
import axiosClient from '@app/utils/axios';

axiosClient.defaults.baseURL = `${ENVIRONMENTS.GOVTOOL_BASE_URL}/api`;

export type GetDRepListArgs = {
    filters?: string[];
    page?: number;
    pageSize?: number;
    sorting?: DRepListSort;
    status?: DRepStatus[];
    searchPhrase?: string;
};

type DRepListResponse = {
    elements: IDRep[];
    page: number;
    pageSize: number;
    total: number;
};

export const getDRepList = async ({
    sorting,
    filters = [],
    page = 0,
    pageSize = 10,
    searchPhrase = '',
    status = []
}: GetDRepListArgs): Promise<DRepListResponse> => {
    const response = await axiosClient.get('/drep/list', {
        params: {
            page,
            pageSize,
            ...(searchPhrase && { search: searchPhrase }),
            ...(filters.length && { type: filters }),
            ...(sorting && { sort: sorting }),
            ...(status.length && { status })
        }
    });
    return response.data;
};

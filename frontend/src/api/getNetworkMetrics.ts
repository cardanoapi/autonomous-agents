import { ENVIRONMENTS } from '@configs';

import axiosClient from '@app/utils/axios';

axiosClient.defaults.baseURL = `${ENVIRONMENTS.GOVTOOL_BASE_URL}/api`;

export const getNetworkMetrics = async () => {
    const response = await axiosClient.get('/network/metrics');

    return response.data;
};

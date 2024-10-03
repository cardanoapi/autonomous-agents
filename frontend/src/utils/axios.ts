import axios, { AxiosInstance } from 'axios';

import { ENVIRONMENTS } from '@app/configs';

const axiosClient: AxiosInstance = axios.create({
    baseURL: ENVIRONMENTS.api.apiUrl
});

axiosClient.interceptors.response.use(
    (response: any) => response,
    async (error: any) =>
        Promise.reject(
            (error.response &&
                error.response.data &&
                error.response.data.message &&
                error) ||
                'Something went wrong'
        )
);

export default axiosClient;

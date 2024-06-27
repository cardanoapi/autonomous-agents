import axios, { AxiosInstance } from 'axios';

import { ENVIRONMENTS } from '@app/configs';

const axiosClient: AxiosInstance = axios.create({
    baseURL: ENVIRONMENTS.API_URL,
    headers: {
        Authorization: 'Basic c2lyZXRvOkxzOEdRekU5ckxEejhqa1ZXdERIazc='
    }
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

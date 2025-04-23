'use client';

import axios from 'axios';

import { baseAPIurl } from './config';

export interface ISignedData {
    signature: string;
    key: string;
}

export interface IUserResponse {
    address: string;
    created_at: string;
    isSuperUser: boolean;
}

export const SendLoginRequest = async (signedData: ISignedData): Promise<IUserResponse> => {
    if (!signedData) {
        throw new Error('Signed data is null');
    }

    try {
        const response = await axios.post(`${baseAPIurl}/auth/login`, signedData, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (!response || !response.data) {
            throw new Error('No response or response data');
        }
        return response.data;
    } catch (error) {
        console.error('Error Logging in User', error);
        throw error;
    }
};

export const SendLogoutRequest = async () => {
    try {
        const response = await axios.post(
            `${baseAPIurl}/auth/logout`,
            {},
            {
                withCredentials: true
            }
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export interface IUserStatusResponse {
    is_admin: boolean;
}

export const getUserStatus = async (): Promise<IUserStatusResponse | false> => {
    try {
        const response = await axios.post<IUserStatusResponse>(
            `${baseAPIurl}/auth/status`,
            {},
            {
                withCredentials: true
            }
        );

        if (response.status === 200) {
            return response.data;
        } else {
            return false;
        }
    } catch (error: any) {
        // return false on unauthorized error
        if (error.response?.status === 401) {
            return false;
        }
        throw error;
    }
};

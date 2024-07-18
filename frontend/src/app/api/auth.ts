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
    is_superUser: boolean;
}

export const SendLoginRequest = async (
    signedData: ISignedData
): Promise<IUserResponse> => {
    if (!signedData) {
        throw new Error('Signed data is null');
    }

    try {
        const response = await axios.post(`${baseAPIurl}/login`, signedData, {
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
            `${baseAPIurl}/logout`,
            {},
            {
                withCredentials: true
            }
        );
        console.log(response.data);
    } catch (error) {
        throw error;
    }
};

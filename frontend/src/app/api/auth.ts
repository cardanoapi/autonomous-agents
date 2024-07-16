'use client';

import axios from 'axios';

import { baseAPIurl } from './config';

export interface ISignedData {
    signature: string;
    key: string;
}

export const SendLoginRequest = async (signedData: ISignedData) => {
    try {
        const response = await axios.post(`${baseAPIurl}/login`, signedData, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        console.log(response.data);
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

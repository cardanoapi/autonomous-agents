import { bech32 } from 'bech32';
import { CIP30Instance } from 'kuber-client/types';

import { ISchema } from '@app/app/(pages)/templates/create-template/components/event/EventTrigger';

export const convertLovelaceToAda = (lovelace?: number) => {
    if (lovelace) {
        return Number((lovelace / 1e6).toFixed(3));
    }

    return '0';
};

export async function getStakeAddress(enabledApi: CIP30Instance) {
    const rewardAddresses = await enabledApi.getRewardAddresses();
    const walletStakeAddress = rewardAddresses.length > 0 ? rewardAddresses[0] : '';
    return walletStakeAddress;
}

export function hexToBech32(hexAddress: string, prefix = 'drep') {
    const data = Buffer.from(hexAddress, 'hex');

    // Convert binary data into 5-bit groups as needed for Bech32
    const words = bech32.toWords(data);

    // Encode with Bech32 using the given prefix (usually 'stake')
    return bech32.encode(prefix, words);
}

export function bech32toHex(bechAddress: string) {
    if (bechAddress.startsWith('drep')) {
        const decodedId = bech32.decode(bechAddress, 100);
        const data = bech32.fromWords(decodedId.words);
        return Buffer.from(data).toString('hex');
    }
    return bechAddress;
}

export function getNestedTxProperties(obj: ISchema) {
    const result: ISchema[] = [];
    const txObjectOperators = obj.operators
        ? Array.isArray(obj.operators)
            ? obj.operators
            : [obj.operators]
        : ['eq'];

    function recursiveFlatten(property: ISchema, parentId: any = []) {
        const { id, type, properties, validator } = property;
        const newId: string[] = [...parentId, id];

        if (properties && Array.isArray(properties)) {
            properties.forEach((child) => recursiveFlatten(child, newId));
        } else {
            result.push({
                id: newId,
                label: newId.join('.'),
                type,
                operators: txObjectOperators,
                validator
            });
        }
    }

    recursiveFlatten(obj);
    return result;
}

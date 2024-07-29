import { CIP30Instance } from 'kuber-client/types';

export const convertLovelaceToAda = (lovelace?: number) => {
    if (lovelace) {
        return Number((lovelace / 10e6).toFixed(3));
    }

    return '0';
};

export async function getStakeAddress(enabledApi: CIP30Instance) {
    const rewardAddresses = await enabledApi.getRewardAddresses();
    const walletStakeAddress = rewardAddresses.length > 0 ? rewardAddresses[0] : '';
    return walletStakeAddress;
}

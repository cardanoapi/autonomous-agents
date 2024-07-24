import { CIP30Instance } from 'kuber-client/types';

export async function generateSignedData(walletApi: CIP30Instance) {
    //const changeAddr = await walletApi.getChangeAddress();
    const rewardAddresses = await walletApi.getRewardAddresses();
    const walletStakeAddress = rewardAddresses.length > 0 ? rewardAddresses[0] : null;
    const messageUtf = `Sigining into Autonomous Agent Testing at ${new Date().toString()}`;
    const messageHex = Buffer.from(messageUtf).toString('hex');
    //@ts-ignore
    const signData = await walletApi.signData(walletStakeAddress, messageHex);
    return signData;
}

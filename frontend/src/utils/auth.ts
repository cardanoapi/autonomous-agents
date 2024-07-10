import { CIP30Instance } from 'kuber-client/types';

export function generateSignData(walletApi: CIP30Instance) {
    const changeAddr = walletApi.getChangeAddress();
    const netowrkId = walletApi.getNetworkId();
    const messageUtf = `account : ${changeAddr}`;
    const messageHex = Buffer.from(messageUtf).toString('hex');
    //@ts-ignore
    const signData = walletApi.signData(changeAddr, messageHex);
    console.log(changeAddr, netowrkId, signData);
    return signData;
}

import { CIP30Instance } from 'kuber-client/types';

export async function generateSignedData(walletApi: CIP30Instance) {
    const changeAddr = await walletApi.getChangeAddress();
    const messageUtf = `account : ${changeAddr}`;
    const messageHex = Buffer.from(messageUtf).toString('hex');
    //@ts-ignore
    const signData = await walletApi.signData(changeAddr, messageHex);
    return signData;
}

import environments from '@app/configs/environments';

export function convertToBase64(agentSecretKey: string) {
    const newSecretKey = environments.network + '_' + agentSecretKey;
    const buffer = new Buffer(newSecretKey);
    return buffer.toString('base64');
}

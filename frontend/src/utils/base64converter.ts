import environments from '@app/configs/environments';

export function convertToBase64(agentSecretKey: string) {
    const newSecretKey = environments.NEXT_PUBLIC_MANAGER_BASE_DOMAIN ? '_' + agentSecretKey : environments.network + '_' + agentSecretKey;
    const buffer = new Buffer(newSecretKey);
    return buffer.toString('base64');
}

const NetworkName = ['preview', 'preprod', 'sanchonet']

export function validateToken(token: string) {
    if (token.split('_').length !== 2) {
        return 'Not a valid token. Missing secret key'
    }
    if (!NetworkName.includes(token.split('_')[0]))
        return 'Not a valid network name'
    return ''
}

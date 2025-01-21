import environments from '../../config/environments'

export async function checkKuberHealthStatus() {
    let kuberBaseUrl = environments.kuberBaseUrl
    const KuberAPIKey = environments.kuberApiKey

    kuberBaseUrl = kuberBaseUrl.endsWith('/') ? kuberBaseUrl + 'api/v3/health' : kuberBaseUrl + '/api/v3/health'
    const headers: HeadersInit = {
        'content-type': 'application/json',
        'api-key': KuberAPIKey,
    }
    try {
        const resp = await fetch(kuberBaseUrl, {
            headers,
            signal: AbortSignal.timeout(5000),
        })
        if (resp.status != 200) {
            console.error('KuberHealthCheckError : ', await resp.text())
        }
        return resp.status === 200
    } catch (err) {
        console.error('KuberHealthCheckError : ', err)
        return false
    }
}

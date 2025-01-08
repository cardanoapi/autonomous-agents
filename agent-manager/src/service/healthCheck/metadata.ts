import environments from '../../config/environments'

export async function metadataHealthCheck() {
    let baseUrl = environments.metaDataBaseURL
    baseUrl = baseUrl.endsWith('/') ? baseUrl + 'api/health' : baseUrl + '/api/health'
    try {
        const response = await fetch(baseUrl)
        return response.status === 200
    } catch (err) {
        console.error('MetadataHealthCheckError : ', err)
        return false
    }
}

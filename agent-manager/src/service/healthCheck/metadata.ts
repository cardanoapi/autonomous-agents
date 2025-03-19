import environments from '../../config/environments'
 let baseUrl = environments.metaDataBaseURL
baseUrl = baseUrl.endsWith('/') ? baseUrl + 'api/health' : baseUrl + '/api/health'
export async function metadataHealthCheck() {
   
    try {
        const response = await fetch(baseUrl)
        if (response.status != 200) {
            console.error('MetadataHealthCheckError : ', await response.text())
        }
        return response.status === 200
    } catch (err) {
        console.error('MetadataHealthCheckError : ', err)
        return false
    }
}

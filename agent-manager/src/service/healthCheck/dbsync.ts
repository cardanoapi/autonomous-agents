import environments from '../../config/environments'

export async function checkDbSyncStatus() {
    let dbSyncBaseUrl = environments.dbSyncBaseUrl
    dbSyncBaseUrl = dbSyncBaseUrl.endsWith('/') ? dbSyncBaseUrl + 'health' : dbSyncBaseUrl + '/health'

    try {
        const resp = await fetch(dbSyncBaseUrl)
        return resp.status === 200
    } catch (err) {
        console.error('DbSyncHealthCheckError : ', err)
        return false
    }
}

import environments from '../../config/environments'

export async function checkDbSyncStatus() {
    let dbSyncBaseUrl = environments.dbSyncBaseUrl
    dbSyncBaseUrl = dbSyncBaseUrl.endsWith('/') ? dbSyncBaseUrl + 'health' : dbSyncBaseUrl + '/health'

    try {
        const resp = await fetch(dbSyncBaseUrl)
        if (resp.status != 200) {
            console.error('DbSyncHealthCheckError : ', await resp.text())
        }
        return resp.status === 200
    } catch (err) {
        console.error('DbSyncHealthCheckError : ', err)
        return false
    }
}

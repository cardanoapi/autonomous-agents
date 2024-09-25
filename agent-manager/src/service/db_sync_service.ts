import environments from '../config/environments'

class DBSYNC {
    MAX_CONCURRENT_CALLS = 8
    active_calls = 0
    call_queue: Array<any> = []
    providerUrl: string

    constructor() {
        const dbSyncBaseUrl = environments.dbSyncBaseUrl
        if (!dbSyncBaseUrl) {
            console.log('DbSync base url not provided.')
            process.exit(1)
        }
        this.providerUrl = dbSyncBaseUrl
        if (!this.providerUrl.endsWith('/')) {
            this.providerUrl = this.providerUrl + '/'
        }
    }

    async checkDrepRegistration(drepId: string): Promise<any> {
        const headers: HeadersInit = {
            'content-type': 'application/json',
        }
        return new Promise((resolve, reject) => {
            this.call_queue.push({
                body: ['GET', `drep/${drepId}`, headers],
                resolve,
                reject,
            })
            this.handleApiCallQueue()
        })
    }

    private handleApiCallQueue = () => {
        if (this.active_calls < this.MAX_CONCURRENT_CALLS && this.call_queue.length) {
            const { body, resolve, reject } = this.call_queue.shift()
            this.active_calls++
            this.call
                .apply(this as DBSYNC, body)
                .then((res: any) => {
                    resolve(res.json())
                })
                .catch(reject)
                .finally(() => {
                    this.active_calls--
                    this.handleApiCallQueue()
                })
        }
    }

    private async call(method: string, url: string, headers?: HeadersInit): Promise<Response> {
        return fetch(`${this.providerUrl}${url}`, {
            method,
            headers,
        })
            .catch((e) => {
                console.error(`${this.providerUrl}${method}`, e)
                throw Error(`DBSYNC API call : ` + e.message)
            })
            .then((res) => {
                return res
            })
    }
}

export const dbSync = new DBSYNC()

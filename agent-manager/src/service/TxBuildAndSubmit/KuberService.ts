import environments from '../../config/environments'
import { TxBuildAndSubmitBaseClass } from './TxBuildAndSubmitBaseClass'

class Kuber extends TxBuildAndSubmitBaseClass {
    MAX_CONCURRENT_CALLS = 8
    active_calls = 0
    call_queue: Array<any> = []
    providerUrl: string

    constructor() {
        super()
        const kuberUrl = environments.kuberBaseUrl
        if (!kuberUrl) {
            console.log('Kuber Url not provided.')
            process.exit(1)
        }
        this.providerUrl = kuberUrl
        if (!this.providerUrl.endsWith('/')) {
            this.providerUrl = this.providerUrl + '/'
        }
    }

    private static parseJson(str: string): any {
        try {
            return JSON.parse(str)
        } catch (e: any) {
            throw `KubærApi response JSON parse failed : ${e.message || e} : ${str}`
        }
    }

    async getBalance(address: string): Promise<any> {
        const KuberAPIKey = environments.kuberApiKey
        const headers: HeadersInit = {
            'content-type': 'application/json',
        }
        if (!KuberAPIKey) {
            console.error('No Api Key provided.')
            process.exit(1)
        }
        headers['api-key'] = KuberAPIKey
        return new Promise((resolve, reject) => {
            this.call_queue.push({
                body: ['GET', `api/v3/utxo?address=${address}`, null, headers],
                resolve,
                reject,
            })
            this.handleApiCallQueue()
        })
    }

    async buildTx(txSpec: any): Promise<any> {
        const KuberAPIKey = environments.kuberApiKey
        const headers: HeadersInit = {
            'content-type': 'application/json',
        }
        if (!KuberAPIKey) {
            console.error('No Api Key provided.')
            process.exit(1)
        }
        headers['api-key'] = KuberAPIKey
        return new Promise((resolve, reject) => {
            this.call_queue.push({
                body: ['POST', `api/v1/tx`, JSON.stringify(txSpec), headers],
                resolve,
                reject,
            })
            this.handleApiCallQueue()
        })
    }

    async buildAndSubmitTx(txSpec: any): Promise<any> {
        const KuberAPIKey = environments.kuberApiKey
        const headers: HeadersInit = {
            'content-type': 'application/json',
        }
        if (!KuberAPIKey) {
            console.error('No Api Key provided.')
            process.exit(1)
        }
        headers['api-key'] = KuberAPIKey
        return new Promise((resolve, reject) => {
            this.call_queue.push({
                body: ['POST', `api/v1/tx?submit=true`, JSON.stringify(txSpec), headers],
                resolve,
                reject,
            })
            this.handleApiCallQueue()
        })
    }

    async getScriptPolicy(policy: Record<string, any>): Promise<string> {
        return this.call('POST', 'api/v1/scriptPolicy', JSON.stringify(policy), {
            'content-type': 'application/json',
        }).then((res) => {
            return res.text()
        })
    }

    async calculateMinFee(tx: Buffer): Promise<bigint> {
        return this.call('POST', 'api/v1/tx/fee', tx, {
            'content-type': 'application/cbor',
        }).then((res) => {
            return res.text().then((txt) => {
                return BigInt(txt)
            })
        })
    }

    private handleApiCallQueue = () => {
        if (this.active_calls < this.MAX_CONCURRENT_CALLS && this.call_queue.length) {
            const { body, resolve, reject } = this.call_queue.shift()
            this.active_calls++
            this.call
                .apply(this as Kuber, body)
                .then((res) => {
                    return res.text()
                })
                .then((str) => {
                    console.log('Kuber Call Response : ', str)
                    resolve(Kuber.parseJson(str))
                })
                .catch(reject)
                .finally(() => {
                    this.active_calls--
                    this.handleApiCallQueue()
                })
        }
    }

    private async call(method: string, url: string, data: BodyInit, headers?: HeadersInit): Promise<Response> {
        return fetch(`${this.providerUrl}${url}`, {
            method,
            body: data,
            headers,
        })
            .catch((e) => {
                console.error(`${this.providerUrl}${method}`, e)
                throw Error(`Kubær API call : ` + e.message)
            })
            .then((res) => {
                if (res.status === 200) {
                    return res
                } else {
                    return res.text().then((txt) => {
                        let json: any
                        try {
                            json = JSON.parse(txt)
                        } catch (e) {
                            return Promise.reject(Error(`KubærApi [Status ${res.status}] : ${txt}`))
                        }
                        if (json) {
                            return Promise.reject(
                                Error(`KubærApi [Status ${res.status}] : ${json.message ? json.message : txt}`)
                            )
                        } else {
                            return Promise.reject(Error(`KubærApi [Status ${res.status}] : ${txt}`))
                        }
                    })
                }
            })
    }
}

export const kuber = new Kuber()
export type KuberType = Kuber

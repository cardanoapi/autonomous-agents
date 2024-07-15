class Kuber {
    providerUrl: string
    constructor(providerUrl: string) {
        if (providerUrl.endsWith('/')) {
            this.providerUrl = providerUrl
        } else {
            this.providerUrl = providerUrl + '/'
        }
    }

    private static parseJson(str: string): any {
        try {
            return JSON.parse(str)
        } catch (e: any) {
            throw `KubærApi response JSON parse failed : ${e.message || e} : ${str}`
        }
    }

    async buildTx(txSpec: any, submit?: boolean): Promise<any> {
        const KuberAPIKey = process.env.KUBER_API_KEY
        if (!KuberAPIKey) {
            console.error('No Api Key provided.')
            process.exit(1)
        }
        return this.call('POST', `api/v1/tx${submit ? '?submit=true' : ''}`, JSON.stringify(txSpec), {
            'content-type': 'application/json',
            'api-key': `${KuberAPIKey}`,
        })
            .then((res) => {
                console.log('response is : ', res)
                return res.text()
            })
            .then((str) => {
                console.log('Kuber Call Response : ', str)
                return Kuber.parseJson(str)
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
                if ('status' in res && res.status === 200) {
                    return res
                } else {
                    return (
                        'text' in res &&
                        res.text().then((txt) => {
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
                    )
                }
            })
    }
}

const kuberUrl = process.env.KUBER_BASE_URL
if (!kuberUrl) {
    console.log('Kuber Url not provided.')
    process.exit(1)
}
export const kuber = new Kuber(kuberUrl)
export type KuberType = Kuber

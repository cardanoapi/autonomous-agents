import environments from '../config/environments'
import * as blake from 'blakejs'

class MetadataService {
    metadataBaseUrl
    constructor() {
        this.metadataBaseUrl = environments.metaDataBaseURL
    }

    async saveMetadata(content: string) {
        const hash = blake.blake2bHex(content, undefined, 32)
        const res = await fetch(`${this.metadataBaseUrl}/data/${hash}`, {
            method: 'PUT',
            body: content,
        })
        if (res.ok) {
            return { dataHash: hash, url: `${this.metadataBaseUrl}/data/${hash}` }
        } else {
            throw new Error((await res.text()) || (await res.json()))
        }
    }

    async fetchMetadata(url: string, hash: string) {
        const res = await fetch(`${this.metadataBaseUrl}/api/metadata?url=${url}&hash=${hash}`, {
            method: 'GET',
        })
        if (res.ok) {
            return await res.json()
        } else {
            throw new Error((await res.text()) || (await res.json()))
        }
    }
}

export const metaDataService = new MetadataService()

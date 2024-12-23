import environments from '../config/environments'
import * as blake from 'blakejs'

class MetadataService {
    metadataSaveBaseUrl
    metadataFetchBaseUrl
    constructor() {
        this.metadataSaveBaseUrl = environments.metaDataBaseURL
        this.metadataFetchBaseUrl = environments.metaDataFetchBaseURL
    }

    async saveMetadata(content: string) {
        const hash = blake.blake2bHex(content, undefined, 32)
        const res = await fetch(`${this.metadataSaveBaseUrl}/data/${hash}`, {
            method: 'PUT',
            body: content,
        })
        if (res.ok) {
            return { dataHash: hash, url: `${this.metadataSaveBaseUrl}/data/${hash}` }
        } else {
            throw new Error((await res.text()) || (await res.json()))
        }
    }

    async fetchMetadata(url: string, hash: string) {
        const res = await fetch(`${this.metadataFetchBaseUrl}/api/metadata?url=${url}&hash=${hash}`, {
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

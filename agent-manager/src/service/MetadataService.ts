import environments from '../config/environments'
import * as blake from 'blakejs'

class MetadataService {
    constructor() {}

    async saveMetadata(content: string) {
        const hash = blake.blake2bHex(content, undefined, 32)
        const res = await fetch(`${environments.metaDataBaseURL}/data/${hash}`, {
            method: 'PUT',
            body: content,
        })
        if (res.ok) {
            return { dataHash: hash, url: `${environments.metaDataBaseURL}/data/${hash}` }
        } else {
            throw new Error((await res.text()) || (await res.json()))
        }
    }
}

export const metaDataService = new MetadataService()

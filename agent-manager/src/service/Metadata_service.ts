import environments from '../config/environments'

class MetadataService {
    constructor() {}

    async saveMetadata(filename: string, content: string) {
        const res = await fetch(`${environments.metaDataBaseURL}/data/${filename}`, {
            method: 'PUT',
            body: content,
        })
        if (res.ok) {
            return `${environments.metaDataBaseURL}/data/${filename}`
        } else {
            throw new Error((await res.text()) || (await res.json()))
        }
    }
}

export const metaDataService = new MetadataService()

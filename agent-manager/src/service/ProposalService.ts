export class ProposalProxyService {
    private base: string
    constructor() {
        this.base = process.env.BACKEND_BASE_URL || 'http://host.docker.internal:8000/api'
    }
    async fetchProposals(page = 1, pageSize = 10, sort = 'createDate', search = '') {
        const url = new URL(this.base.replace(/\/+$/, '') + '/proposals')
        url.searchParams.set('page', String(page))
        url.searchParams.set('pageSize', String(pageSize))
        url.searchParams.set('sort', sort)
        if (search) url.searchParams.set('search', search)
        console.log('[ProposalService] GET', url.toString())
        const res = await fetch(url.toString())
        console.log('[ProposalService] status', res.status)
        if (!res.ok) {
            throw new Error(`Proposal Service Error ${res.status}`)
        }

        const data = await res.json()
        console.log('[ProposalService] items', Array.isArray(data?.items) ? data.items.length : 0)
        return data
    }
}

export const ProposalService = new ProposalProxyService()

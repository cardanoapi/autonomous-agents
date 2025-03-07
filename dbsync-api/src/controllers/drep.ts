import {Request, Response, Router} from 'express'
import {handlerWrapper} from '../errors/AppError'
import {decodeDrep} from '../helpers/validator'
import {
    fetchDrepDetails,
    fetchDrepList,
    fetchDrepRegistrationDetails,
    fetchDrepVoteDetails,
    fetchDrepLiveDelegators,
    fetchDrepDelegationHistory,
    fetchDRepActiveDelegators,
    fetchDrepLiveStats,
} from '../repository/drep'
import {DrepSortType, DrepStatusType} from '../types/drep'

const router = Router()

const getDrepDetails = async (req: Request, res: Response): Promise<any> => {
    const drep = decodeDrep(req.params.id as string)
    const result = await fetchDrepDetails(drep.credential, drep.isScript)
    return res.status(200).json(result)
}

const getDrepList = async (req: Request, res: Response) => {
    const size = req.query.size ? +req.query.size : 10
    const page = req.query.page ? +req.query.page : 1
    const status = req.query.status ? (req.query.status as DrepStatusType) : undefined
    const sort = req.query.sort ? (req.query.sort as DrepSortType) : undefined
    const searchDrep = req.query.search ? decodeDrep(req.query.search as string) : {credential: '', isScript: undefined}
    const {
        items,
        totalCount
    } = await fetchDrepList(page, size, searchDrep.credential, searchDrep.isScript, status, sort)
    return res.status(200).json({total: totalCount, page, size, items})
}

const getDrepVoteDetails = async (req: Request, res: Response) => {
    const dRepId = decodeDrep(req.params.id as string)
    const result = await fetchDrepVoteDetails(dRepId.credential, dRepId.isScript)
    return res.status(200).json(result)
}

const getDrepDelegationDetails = async (req: Request, res: Response) => {
    const dRepId = decodeDrep(req.params.id as string)
    const result = await fetchDrepDelegationHistory(dRepId.credential, dRepId.isScript)
    return res.status(200).json(result)
}

const getDrepRegistrationDetails = async (req: Request, res: Response) => {
    const dRepId = decodeDrep(req.params.id as string)
    const result = await fetchDrepRegistrationDetails(dRepId.credential, dRepId.isScript)
    return res.status(200).json(result)
}

const getDrepLiveStats = async (req: Request, res: Response) => {
    const dRepId = decodeDrep(req.params.id as string)
    const result = await fetchDrepLiveStats(dRepId.credential, dRepId.isScript)
    return res.status(200).json(result)
}

const getDrepActiveDelegators = async (req: Request, res: Response) => {
    const dRepId = decodeDrep(req.params.id as string)
    const balance = req.query.balance === 'true'
    const result = await fetchDRepActiveDelegators(dRepId.credential, dRepId.isScript, balance)
    return res.status(200).json(result)
}

const getDrepLiveDelegators = async (req: Request, res: Response) => {
    const dRepId = decodeDrep(req.params.id as string)
    const balance = req.query.balance === 'true'
    const liveDelegators = await fetchDrepLiveDelegators(dRepId.credential, dRepId.isScript, balance)
    return res.status(200).json(liveDelegators)
}

router.get('/', handlerWrapper(getDrepList))
router.get('/:id', handlerWrapper(getDrepDetails))
router.get('/:id/vote', handlerWrapper(getDrepVoteDetails))
router.get('/:id/delegation', handlerWrapper(getDrepDelegationDetails))
router.get('/:id/registration', handlerWrapper(getDrepRegistrationDetails))
router.get('/:id/stats/live', handlerWrapper(getDrepLiveStats))
router.get('/:id/live-delegators', handlerWrapper(getDrepLiveDelegators))
router.get('/:id/active-delegators', handlerWrapper(getDrepActiveDelegators))

export default router

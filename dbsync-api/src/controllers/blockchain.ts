import { Request, Response, Router } from 'express'
import { handlerWrapper } from '../errors/AppError'
import { fetchEpochDuration, fetchEpochParams } from '../repository/blockchain'

const router = Router()

const getEpochDuration = async (req: Request, res: Response): Promise<any> => {
    const limit = parseInt(req.query.limit as string)
    const result = await fetchEpochDuration(limit || 5)
    return res.status(200).json(result)
}

const getEpochParams = async (req: Request, res: Response): Promise<any> => {
    const epoch_no = req.query.epoch_no as string
    const result = await fetchEpochParams(parseInt(epoch_no) ? parseInt(epoch_no) : undefined)
    return res.status(200).json(result)
}

router.get('/epoch', handlerWrapper(getEpochDuration))
router.get('/epoch/params', handlerWrapper(getEpochParams))

export default router

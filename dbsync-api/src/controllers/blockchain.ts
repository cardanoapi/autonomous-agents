import { Request, Response, Router } from 'express'
import { handlerWrapper } from '../errors/AppError'
import { fetchEpochDuration } from '../repository/blockchain'

const router = Router()

const getEpochDuration = async (req: Request, res: Response): Promise<any> => {
    const limit = parseInt(req.query.limit as string)
    const result = await fetchEpochDuration(limit || 5)
    return res.status(200).json(result)
}

router.get('/epoch', handlerWrapper(getEpochDuration))

export default router

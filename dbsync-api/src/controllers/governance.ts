import { PrismaClient } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { handlerWrapper } from '../errors/AppError'
import { fetchActiveToalStake } from '../repository/governance'

const router = Router()

const getToalActiveStake = async (req: Request, res: Response): Promise<any> => {
    const result = await fetchActiveToalStake()
    return res.status(200).json(result)
}

router.get('/active/total-stake', handlerWrapper(getToalActiveStake))
export default router

import { Request, Response, Router } from 'express'
import { handlerWrapper } from '../errors/AppError'
import { fetchActiveToalStake, fetchLiveTotalStake } from '../repository/governance'
import NodeCache from 'node-cache'


const router = Router()
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 })

const updateCache = async () => {
    const activeTotalStake = await fetchActiveToalStake()
    const liveTotalStake = await fetchLiveTotalStake()

    cache.set('activeTotalStake', activeTotalStake)
    cache.set('liveTotalStake', liveTotalStake)
}

updateCache()
setInterval(updateCache, 60 * 60 * 1000) 

const getToalActiveStake = async (req: Request, res: Response) => {
    const cachedData = cache.get('activeTotalStake')
    if (cachedData) return res.status(200).json(cachedData)
    const result = await fetchActiveToalStake()
    cache.set('activeTotalStake', result)
    return res.status(200).json(result)
}

const getToalLiveStake = async (req: Request, res: Response) => {
    const cachedData = cache.get('liveTotalStake')
    if (cachedData) return res.status(200).json(cachedData)
    const result = await fetchLiveTotalStake()
    cache.set('liveTotalStake', result)
    return res.status(200).json(result)
}

router.get('/active-stake', handlerWrapper(getToalActiveStake))
router.get('/live-stake', handlerWrapper(getToalLiveStake))

export default router

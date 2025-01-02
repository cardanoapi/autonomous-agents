import { Router, Request, Response } from 'express'
import { handlerWrapper } from '../utils/asyncWrapper'
import { checkKafkaStatus } from '../service/healthCheck/kafka'
import { cardanoNodeStatus } from '../service/healthCheck/cardanoNode'

const router = Router()

async function healthCheck(req: Request, res: Response) {
    try {
        const isKafkaHealthy = await checkKafkaStatus()
        const nodeStatus = cardanoNodeStatus.checkStatus()
        return res.status(isKafkaHealthy && nodeStatus.isHealthy ? 200 : 503).send({
            isHealthy: isKafkaHealthy && nodeStatus.isHealthy,
            details: {
                kafka: {
                    isHealthy: isKafkaHealthy,
                },
                cardanoNode: {
                    isHealthy: nodeStatus.isHealthy,
                    secsSinceLastBlock: cardanoNodeStatus.lastTimeStamp,
                    lastBlock: nodeStatus.block,
                },
            },
        })
    } catch (err: any) {
        return res.status(500).send(err.message ? err.message : err)
    }
}

router.get('/', handlerWrapper(healthCheck))

export default router

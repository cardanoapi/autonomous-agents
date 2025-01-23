import { Router, Request, Response } from 'express'
import { handlerWrapper } from '../utils/asyncWrapper'
import { checkKafkaStatus } from '../service/healthCheck/kafka'
import { cardanoNodeStatus } from '../service/healthCheck/cardanoNode'
import { prisma } from '../repository/dbClient'
import { checkKuberHealthStatus } from '../service/healthCheck/kuber'
import { checkDbSyncStatus } from '../service/healthCheck/dbsync'
import { metadataHealthCheck } from '../service/healthCheck/metadata'

const router = Router()

async function databaseHealthCheck() {
    const result: any = await prisma.$queryRaw`SELECT 1 AS result`
    return result[0].result === 1
}

async function healthCheck(req: Request, res: Response) {
    try {
        const [isKafkaHealthy, nodeStatus, isDbSyncHealthy, isKuberHealthy, isDatabaseHealthy, isMetadataHealthy] =
            await Promise.all([
                checkKafkaStatus(),
                cardanoNodeStatus.checkStatus(),
                checkDbSyncStatus(),
                checkKuberHealthStatus(),
                databaseHealthCheck(),
                metadataHealthCheck(),
            ])

        const isHealthy =
            isKafkaHealthy &&
            nodeStatus.isHealthy &&
            isDbSyncHealthy &&
            isKuberHealthy &&
            isDatabaseHealthy &&
            isMetadataHealthy

        const healthCheckStatus = {
            isHealthy,
            details: {
                kafka: {
                    isHealthy: isKafkaHealthy,
                },
                cardanoNode: {
                    isHealthy: nodeStatus.isHealthy,
                    secsSinceLastBlock: nodeStatus.secsSinceLastBlock,
                    lastBlockTime: new Date(nodeStatus.lastBlockTimeStamp).toLocaleTimeString(),
                    lastBlock: nodeStatus.block,
                },
                dbSync: {
                    isHealthy: isDbSyncHealthy,
                },
                kuber: {
                    isHealthy: isKuberHealthy,
                },
                database: {
                    isHealthy: isDatabaseHealthy,
                },
                metadata: {
                    isHealthy: isMetadataHealthy,
                },
            },
        }
        if (!isHealthy) {
            console.log('HealthCheckError: ', healthCheckStatus)
        }
        return res.status(isHealthy ? 200 : 503).send(healthCheckStatus)
    } catch (err: any) {
        console.log('HealthCheckError : ', err)
        return res.status(500).send(err.message ? err.message : err)
    }
}

router.get('/', handlerWrapper(healthCheck))

export default router

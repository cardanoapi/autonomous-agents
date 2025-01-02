import { Router, Request, Response } from 'express'
import { handlerWrapper } from '../utils/asyncWrapper'
import environments from '../config/environments'

const router = Router()

async function blockfrostHealthCheck(req: Request, res: Response) {
    const url = `https://cardano-${environments.networkName}.blockfrost.io/api/v0/health`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            project_id: environments.blockFrostApiKey,
        },
    })
    return res.status(response.status).send(await response.json())
}

router.get('/', handlerWrapper(blockfrostHealthCheck))

export default router

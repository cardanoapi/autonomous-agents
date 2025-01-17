import { Router, Request, Response } from 'express'
import { handlerWrapper } from '../utils/asyncWrapper'
import environments from '../config/environments'

const router = Router()

async function blockfrostHealthCheck(req: Request, res: Response) {
    const url = `https://cardano-${environments.networkName}.blockfrost.io/api/v0/health`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                project_id: environments.blockFrostApiKey,
            },
        })
        const respJson = await response.json()
        if (response.status != 200) {
            console.log('BlockFrostCheckError : ', respJson)
        }
        return res.status(response.status).send(respJson)
    } catch (err: any) {
        console.log('BlockFrostCheckError : ', err)
        return res.status(500).send({ error: err.message ? err.message : err })
    }
}

router.get('/', handlerWrapper(blockfrostHealthCheck))

export default router

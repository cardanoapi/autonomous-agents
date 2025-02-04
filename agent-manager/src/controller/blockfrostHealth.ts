import { Router, Request, Response } from 'express'
import { handlerWrapper } from '../utils/asyncWrapper'
import environments from '../config/environments'

const router = Router()

async function callBlockFrostHealthCheckEndpoint(url: string) {
    return fetch(url)
        .catch((e) => {
            const a = {
                statusCode: 500,
                message: e.message ? e.message : e,
            }
            return Promise.reject(a)
        })
        .then((res) => {
            if (res.status === 200) {
                return res
            } else {
                return res.text().then((txt) => {
                    let json: any
                    try {
                        json = JSON.parse(txt)
                    } catch (e) {
                        return Promise.reject({
                            statusCode: res.status,
                            message: txt,
                        })
                    }
                    if (json) {
                        return Promise.reject({
                            statusCode: res.status,
                            message: json.message ? json.message : txt,
                        })
                    } else {
                        return Promise.reject({
                            statusCode: res.status,
                            message: txt,
                        })
                    }
                })
            }
        })
}

async function blockfrostHealthCheck(req: Request, res: Response) {
    const url = `https://cardano-${environments.networkName}.blockfrost.io/api/v0/health`
    try {
        const blockFrostHealthCheckResponse = await callBlockFrostHealthCheckEndpoint(url)
        const blockFrostHealthCheckResponseJson = await blockFrostHealthCheckResponse.json()
        return res.status(200).send(blockFrostHealthCheckResponseJson)
    } catch (e: any) {
        console.error('BlockFrostHealthCheckError : ', e.message ? e.message : e)
        return res.status(e.statusCode).send({ error: e.message ? e.message : e })
    }
}

router.get('/', handlerWrapper(blockfrostHealthCheck))

export default router

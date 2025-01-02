import { Router, Request, Response } from 'express'
import { handlerWrapper } from '../utils/asyncWrapper'
import { checkKafkaStatus } from '../service/healthCheck/kafka'

const router = Router()

function healthCheck(req: Request, res: Response) {
    checkKafkaStatus()
        .then((a) => console.log('Success : ', a))
        .catch((err) => console.log('Error: ', err))
    return res.status(200).send({ Msg: 'OK ' })
}

router.get('/', handlerWrapper(healthCheck))

export default router

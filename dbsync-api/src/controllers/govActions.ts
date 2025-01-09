import { PrismaClient } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { handlerWrapper } from '../errors/AppError'

const router = Router()

type govAction = { govActionId: string; govActionType: string; status: string }

const prisma = new PrismaClient()

const getGovActions = async (req: Request, res: Response) => {
    const actionId = req.query.id

    try {
        const parseGovActionResponseFormat = (action: any) => {
            let status = 'unknown'
            if (action.ratified_epoch) status = 'ratified'
            else if (action.enacted_epoch) status = 'enacted'
            else if (action.dropped_epoch) status = 'dropped'
            else if (action.expired_epoch) status = 'expired'

            const formattedGovAction: govAction = {
                govActionId: `${action.tx_id}#${action.index}`,
                govActionType: action.type,
                status,
            }
            return formattedGovAction
        }
        if (!actionId) {
            const actions = await prisma.gov_action_proposal.findMany()
            const formattedActions: govAction[] = actions.map(parseGovActionResponseFormat)
            return res.json(formattedActions)
        } else {
            const actionIdString = actionId as string
            const splitActionId = actionIdString.split('#')
            if (splitActionId.length !== 2 || isNaN(Number(splitActionId[1]))) {
                throw new Error(`Invalid actionId format. Expected format: "tx_id#index" but got: ${actionIdString}`)
            }
            const action = await prisma.gov_action_proposal.findFirst({
                where: {
                    tx_id: BigInt(splitActionId[0]),
                    index: BigInt(splitActionId[1]),
                },
            })

            if (!action) {
                return res.status(404).json({ error: 'Gov action not found' })
            }

            return res.json(parseGovActionResponseFormat(action))
        }
    } catch (error) {
        console.error('Error fetching government actions:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

router.get('/', handlerWrapper(getGovActions))

export default router

import { PrismaClient } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { handlerWrapper } from '../errors/AppError'

const router = Router()

type govAction = {
    govActionId: string
    govActionType: string
    history?: { ratifiedEpoch?: number; enactedEpoch?: number; droppedEpoch?: number; expiredEpoch?: number }
}

const prisma = new PrismaClient()

const getGovActions = async (req: Request, res: Response) => {
    const actionHash = req.query.id as string

    try {
        const parseGovActionResponseFormat = async (action: any) => {
            // Fetch the tx.hash from the related transaction
            const tx = await prisma.tx.findUnique({
                where: { id: action.tx_id },
            })
            if (!tx) throw new Error(`Transaction with ID ${action.tx_id} not found`)
            const history: Record<string, number> = {}
            if (action.ratified_epoch) history.ratifiedEpoch = action.ratified_epoch
            if (action.enacted_epoch) history.enactedEpoch = action.enacted_epoch
            if (action.dropped_epoch) history.dropped_epoch = action.dropped_epoch
            if (action.expired_epoch) history.expired_epoch = action.expired_epoch

            const formattedGovAction: govAction = {
                govActionId: `${Buffer.from(tx.hash).toString('hex')}#${action.index}`,
                govActionType: action.type,
                ...(Object.keys(history).length > 0 && { history }),
            }
            return formattedGovAction
        }

        let actions
        if (!actionHash) {
            // Fetch all actions
            actions = await prisma.gov_action_proposal.findMany()
        } else {
            // Convert actionHash (hex string) to bytes for filtering
            const txHashBytes = Buffer.from(actionHash, 'hex')

            // Find the related transaction by hash
            const tx = await prisma.tx.findUnique({
                where: { hash: txHashBytes },
            })
            if (!tx) {
                return res.status(404).json({ error: 'Transaction not found' })
            }

            // Fetch actions linked to the transaction
            actions = await prisma.gov_action_proposal.findMany({
                where: {
                    tx_id: tx.id,
                },
            })
        }

        const formattedActions: govAction[] = await Promise.all(actions.map(parseGovActionResponseFormat))

        return res.json(formattedActions)
    } catch (error) {
        console.error('Error fetching government actions:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

router.get('/', handlerWrapper(getGovActions))

export default router

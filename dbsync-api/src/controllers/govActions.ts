import { PrismaClient } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { handlerWrapper } from '../errors/AppError'

const router = Router()

type govAction = { govActionId: string; govActionType: string; status: string }

const prisma = new PrismaClient()

const getGovActions = async (req: Request, res: Response) => {
    const actionHash = req.query.id as string

    try {
        const parseGovActionResponseFormat = async (action: any) => {
            let status = 'unknown'
            if (action.ratified_epoch) status = 'ratified'
            else if (action.enacted_epoch) status = 'enacted'
            else if (action.dropped_epoch) status = 'dropped'
            else if (action.expired_epoch) status = 'expired'

            // Fetch the tx.hash from the related transaction
            const tx = await prisma.tx.findUnique({
                where: { id: action.tx_id },
            })
            if (!tx) throw new Error(`Transaction with ID ${action.tx_id} not found`)

            const formattedGovAction: govAction = {
                govActionId: `${Buffer.from(tx.hash).toString('hex')}#${action.index}`,
                govActionType: action.type,
                status,
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

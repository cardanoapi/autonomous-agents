import { Request, Response, Router } from 'express'
import { handlerWrapper } from '../errors/AppError'
import { convertToHexIfBech32, isHexValue, validateAddress } from '../helpers/validator'
import {
    fetchDrepDelegationDetails,
    fetchDrepDetails,
    fetchDrepList,
    fetchDrepRegistrationDetails,
    fetchDrepVoteDetails,
} from '../repository/drep'
import { DrepSortType, DrepStatusType } from '../types/drep'
import { fetchDelegationDetail, fetchDelegationRewardBalance } from '../repository/delegation'
import { fetchStakeAddressId, fetchStakeAddressUtxoSum } from '../repository/stakeAddress'

const router = Router()

const getDrepDetails = async (req: Request, res: Response): Promise<any> => {
    const dRepId = convertToHexIfBech32(req.params.id as string)
    if (dRepId && !isHexValue(dRepId)) {
        return res.status(400).json({ message: 'Provide a valid Drep ID' })
    }
    const result = await fetchDrepDetails(dRepId)
    return res.status(200).json(result)
}

const getDrepList = async (req: Request, res: Response) => {
    const size = req.query.size ? +req.query.size : 10
    const page = req.query.page ? +req.query.page : 1
    const status = req.query.status ? (req.query.status as DrepStatusType) : undefined
    const sort = req.query.sort ? (req.query.sort as DrepSortType) : undefined
    const search = convertToHexIfBech32(req.query.search as string)
    const { items, totalCount } = await fetchDrepList(page, size, search, status, sort)
    return res.status(200).json({ total: totalCount, page, size, items })
}

const getDrepVoteDetails = async (req: Request, res: Response) => {
    const dRepId = convertToHexIfBech32(req.params.id as string)
    if (dRepId && !isHexValue(dRepId)) {
        return res.status(400).json({ message: 'Provide a valid Drep ID' })
    }
    const result = await fetchDrepVoteDetails(dRepId)
    return res.status(200).json(result)
}

const getDrepDelegationDetails = async (req: Request, res: Response) => {
    const dRepId = convertToHexIfBech32(req.params.id as string)
    if (dRepId && !isHexValue(dRepId)) {
        return res.status(400).json({ message: 'Provide a valid Drep ID' })
    }
    const result = await fetchDrepDelegationDetails(dRepId)
    return res.status(200).json(result)
}

const getDrepRegistrationDetails = async (req: Request, res: Response) => {
    const dRepId = convertToHexIfBech32(req.params.id as string)
    if (dRepId && !isHexValue(dRepId)) {
        return res.status(400).json({ message: 'Provide a valid Drep ID' })
    }
    const result = await fetchDrepRegistrationDetails(dRepId)
    return res.status(200).json(result)
}

const getDrepLiveVotingPower = async (req: Request, res: Response) => {
    const dRepId = convertToHexIfBech32(req.params.id as string)
    if (dRepId && !isHexValue(dRepId)) {
        return res.status(400).json({ message: 'Provide a valid Drep ID' })
    }
    const result = await fetchDrepDelegationDetails(dRepId)
    const delegatorStakeAddresses = result.map((res: any) => res.stakeAddress)
    let totalValue = BigInt(0)

    for (let i = 0; i < delegatorStakeAddresses.length; i++) {
        let address = convertToHexIfBech32(delegatorStakeAddresses[i])
        if (validateAddress(address)) {
            address = address.length === 56 ? `e0${address}` : address
        } else {
            return res.status(400).json({ message: 'Provide a valid address' })
        }
        const delegatorInfo = await fetchDelegationDetail(address)
        if (
            delegatorInfo.drep.drep_id === 'drep_always_abstain' ||
            delegatorInfo.drep.drep_id === 'drep_always_no_confidence'
        ) {
            continue
        } else if (convertToHexIfBech32(delegatorInfo.drep.drep_id) === dRepId) {
            const stakeAddressId = await fetchStakeAddressId(address)
            if (stakeAddressId) {
                const rewards = await fetchDelegationRewardBalance(stakeAddressId)
                const rewardBalance = rewards.rewardbalance == null ? BigInt(0) : BigInt(rewards.rewardbalance)
                const restRewardBalance =
                    rewards.rewardrestbalance == null ? BigInt(0) : BigInt(rewards.rewardrestbalance)
                const value = BigInt(await fetchStakeAddressUtxoSum(stakeAddressId))
                totalValue += value + rewardBalance + restRewardBalance
            }
        }
    }
    const votingPower = {
        votingPower: totalValue.toString(),
    }
    return res.status(200).json(votingPower)
}

router.get('/', handlerWrapper(getDrepList))
router.get('/:id', handlerWrapper(getDrepDetails))
router.get('/:id/vote', handlerWrapper(getDrepVoteDetails))
router.get('/:id/delegation', handlerWrapper(getDrepDelegationDetails))
router.get('/:id/registration', handlerWrapper(getDrepRegistrationDetails))
router.get('/:id/live-voting-power', handlerWrapper(getDrepLiveVotingPower))

export default router

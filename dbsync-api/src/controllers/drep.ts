import {Request, Response, Router} from "express";
import {handlerWrapper} from "../errors/AppError";
import {convertToHexIfBech32, isHexValue} from "../helpers/validator";
import {fetchDrepDelegationDetails, fetchDrepDetails, fetchDrepList, fetchDrepVoteDetails} from "../repository/drep";
import {DrepSortType, DrepStatusType} from "../types/drep";

const router = Router();

const getDrepDetails = async (req: Request, res: Response): Promise<any> => {
    const dRepId = convertToHexIfBech32(req.params.id as string)
    if (dRepId && !isHexValue(dRepId)) {
        return res.status(400).json({message: 'Provide a valid Drep ID'})
    }
    const result = await fetchDrepDetails(dRepId)
    return res.status(200).json(result);
};

const getDrepList = async (req: Request, res: Response) => {
    const size = req.query.size ? +req.query.size : 10
    const page = req.query.page ? +req.query.page : 1
    const status = req.query.status ? req.query.status as DrepStatusType : undefined
    const sort = req.query.sort ? req.query.sort as DrepSortType : undefined
    const search = convertToHexIfBech32(req.query.search as string)
    const {items, totalCount} = await fetchDrepList(page, size, search, status, sort)
    return res.status(200).json({total: totalCount, page, size, items})
}

const getDrepVoteDetails = async (req: Request, res: Response) => {
    const dRepId = convertToHexIfBech32(req.params.id as string)
    if (dRepId && !isHexValue(dRepId)) {
        return res.status(400).json({message: 'Provide a valid Drep ID'})
    }
    const result = await fetchDrepVoteDetails(dRepId)
    return res.status(200).json(result);
}

const getDrepDelegationDetails = async (req: Request, res: Response) => {
    const dRepId = convertToHexIfBech32(req.params.id as string)
    if (dRepId && !isHexValue(dRepId)) {
        return res.status(400).json({message: 'Provide a valid Drep ID'})
    }
    const result = await fetchDrepDelegationDetails(dRepId)
    return res.status(200).json(result);
}

router.get('/', handlerWrapper(getDrepList));
router.get('/:id', handlerWrapper(getDrepDetails));
router.get('/:id/vote', handlerWrapper(getDrepVoteDetails))
router.get('/:id/delegation', handlerWrapper(getDrepDelegationDetails))


export default router;

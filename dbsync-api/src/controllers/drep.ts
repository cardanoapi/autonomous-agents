import { Request, Response, Router } from "express";
import { handlerWrapper } from "../errors/AppError";
import { isHexValue } from "../helpers/validator";
import { fetchDrepDetails, fetchDrepList } from "../repository/drep";
import { DrepSortType, DrepStatusType } from "../types/drep";

const router = Router();

const getDrepDetails = async (req: Request, res: Response): Promise<any> => {
  const drepId = req.query.drepId as string;
  if (!isHexValue(drepId)){
    return res.status(400).json({message:'Provide a valid Drep ID'})
  }
const result = await fetchDrepDetails(drepId)
  return res.status(200).json(result);
};

const getDrepList= async(req:Request,res:Response )=>{
  const size = req.query.size ? +req.query.size : 1
  const page = req.query.page ? +req.query.page : 10
  const status = req.query.status ? req.query.status as DrepStatusType : undefined
  const sort = req.query.sort ? req.query.sort as DrepSortType : undefined
  const dRepId = req.query.dRepId as string

  if ( dRepId && !isHexValue(dRepId as string)){
    return res.status(400).json({message:'Provide a valid Drep ID'})
  }
  const { items,totalCount }  = await fetchDrepList(page,size,dRepId,status,sort)
  return res.status(200).json({totalCount:Math.round(totalCount/size),page,size,items})
}

router.get('/details', handlerWrapper(getDrepDetails));
router.get('/list',handlerWrapper(getDrepList));

export default router;

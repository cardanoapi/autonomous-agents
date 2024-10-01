import { Request, Response, Router } from "express";
import { handlerWrapper } from "../errors/AppError";
import { convertToHexIfBech32, isHexValue } from "../helpers/validator";
import { fetchDrepDetails, fetchDrepList } from "../repository/drep";
import { DrepSortType, DrepStatusType } from "../types/drep";

const router = Router();

const getDrepDetails = async (req: Request, res: Response): Promise<any> => {
  const dRepId = convertToHexIfBech32(req.params.id as string)
  if (dRepId && !isHexValue(dRepId)){
    return res.status(400).json({message:'Provide a valid Drep ID'})
  }
 const result = await fetchDrepDetails(dRepId)
  return res.status(200).json(result);
};

const getDrepList= async(req:Request,res:Response )=>{
  const size = req.query.size ? +req.query.size : 10
  const page = req.query.page ? +req.query.page : 1
  const status = req.query.status ? req.query.status as DrepStatusType : undefined
  const sort = req.query.sort ? req.query.sort as DrepSortType : undefined
  const dRepId =  convertToHexIfBech32(req.query.dRepId as string)
  if ( dRepId && !isHexValue(dRepId)){
    return res.status(400).json({message:'Provide a valid Drep ID'})
  }
  const { items,totalCount }  = await fetchDrepList(page,size,dRepId,status,sort)
  return res.status(200).json({totalCount:Math.round(totalCount/size),page,size,items})
}

router.get('/:id', handlerWrapper(getDrepDetails));
router.get('/',handlerWrapper(getDrepList));

export default router;

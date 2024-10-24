import { Request, Response, Router } from "express";
import { handlerWrapper } from "../errors/AppError";
import { convertToHexIfBech32, validateAddress } from "../helpers/validator";
import { fetchDelegationDetail } from "../repository/delegation";

const router = Router();

const getDelegation = async (req: Request, res: Response): Promise<any> => {
  let address = convertToHexIfBech32(req.query.address as string);
  if (validateAddress(address)){
    address = address.length === 56 ? `e0${address}`:address
  }else{
    return res.status(400).json({message:'Provide a valid address'})
  }
  const result = await fetchDelegationDetail(address)
  return res.status(200).json(result);
};

router.get('/', handlerWrapper(getDelegation));

export default router;

import { Request, Response, Router } from "express";
import { handlerWrapper } from "../errors/AppError";
import { convertToHexIfBech32, validateAddress } from "../helpers/validator";
import { fetchFaucetBalance } from "../repository/address";

const router = Router();

const getFaucetBalance = async (req: Request, res: Response): Promise<any> => {
  let address = convertToHexIfBech32(req.query.address as string)
  if (validateAddress(address)){
    address = address.length === 56 ? `e0${address}`:address
  }else{
    return res.status(400).json({message:'Provide a valid address'})
  }

 const balance = await fetchFaucetBalance(address)

  return res.status(200).json(balance);
};

router.get('/balance', handlerWrapper(getFaucetBalance));

export default router;

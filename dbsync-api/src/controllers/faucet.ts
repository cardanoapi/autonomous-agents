import { Request, Response, Router } from "express";
import { prisma } from "../config/db";
import { handlerWrapper } from "../errors/AppError";
import { convertToHexIfBech32, validateAddress } from "../helpers/validator";

const router = Router();

const getFaucetBalance = async (req: Request, res: Response): Promise<any> => {
  let address = convertToHexIfBech32(req.query.address as string)
  if (validateAddress(address)){
    address = address.length === 56 ? `e0${address}`:address
  }else{
    return res.status(400).json({message:'Provide a valid Hex value'})
  }

  const result  = await prisma.$queryRaw`
      select coalesce(sum(utxo_view.value), 0) as balance
      from stake_address
               join utxo_view
                    on utxo_view.stake_address_id = stake_address.id
      where stake_address.hash_raw = decode(${address}, 'hex')
      group by stake_address.hash_raw;
  ` as Array<Record<string, number>>

  return res.status(200).json({balance:result.length?result[0].balance:0});
};

router.get('/', handlerWrapper(getFaucetBalance));

export default router;

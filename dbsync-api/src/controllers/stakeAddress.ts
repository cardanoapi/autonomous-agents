import { Request, Response, Router } from "express";
import { prisma } from "../config/db";
import { handlerWrapper } from "../errors/AppError";
import { convertToHexIfBech32, validateAddress } from "../helpers/validator";

const router = Router();

const getStakeAddressDetails = async (req: Request, res: Response): Promise<any> => {
  let address = convertToHexIfBech32(req.query.address as string)
  if (validateAddress(address)){
    address = address.length === 56 ? `e0${address}`:address
  }else{
    return res.status(400).json({message:'Provide a valid address'})
  }

  const result  = await prisma.$queryRaw`
      WITH address AS (
          SELECT *
          FROM stake_address
          WHERE hash_raw = decode(${address}, 'hex')
      ),
           latest_registration AS (
               SELECT b.epoch_no, b.slot_no, b.block_no, b.time, encode(t.hash, 'hex') AS tx_hash
               FROM stake_registration sr
                        JOIN public.tx t ON t.id = sr.tx_id
                        JOIN public.block b ON b.id = t.block_id
               WHERE sr.addr_id = (SELECT id FROM address)
               ORDER BY b.block_no DESC
          LIMIT 1
          ),
          latest_deregistration AS (
      SELECT b.epoch_no, b.slot_no, b.block_no, b.time, encode(t.hash, 'hex') AS tx_hash
      FROM stake_deregistration sd
          JOIN public.tx t ON t.id = sd.tx_id
          JOIN public.block b ON b.id = t.block_id
      WHERE sd.addr_id = (SELECT id FROM address)
      ORDER BY b.block_no DESC
          LIMIT 1
          )
      
      SELECT
          json_build_object(
                  'registration', (SELECT row_to_json(latest_registration) FROM latest_registration),
                  'deRegistration', (SELECT row_to_json(latest_deregistration) FROM latest_deregistration)
          ) AS result;
  ` as Record<string,any>[];

  return res.status(200).json(result[0].result);
};

router.get('/', handlerWrapper(getStakeAddressDetails));

export default router;

import { Request, Response, Router } from "express";
import { prisma } from "../config/db";
import { handlerWrapper } from "../errors/AppError";
import { convertToHexIfBech32, validateAddress } from "../helpers/validator";

const router = Router();

const getDelegation = async (req: Request, res: Response): Promise<any> => {
  let address = convertToHexIfBech32(req.query.address as string);
  if (validateAddress(address)){
    address = address.length === 56 ? `e0${address}`:address
  }else{
    return res.status(400).json({message:'Provide a valid Hex value'})
  }
  const result  = await prisma.$queryRaw`
      WITH address AS (
          SELECT *
          FROM stake_address
          WHERE hash_raw = decode(${address}, 'hex')
      ),
          latest_delegation AS (
      SELECT  (select view from drep_hash where id = sd.drep_hash_id) drep, b.epoch_no, b.slot_no, b.block_no, b.time, encode(t.hash, 'hex') AS tx_hash
      FROM delegation_vote sd
          JOIN public.tx t ON t.id = sd.tx_id
          JOIN public.block b ON b.id = t.block_id
      WHERE sd.addr_id = (SELECT id FROM address)
      ORDER BY b.block_no DESC
          LIMIT 1
          ),
          latest_pool_delegation AS (
      SELECT (select view from pool_hash where id=sd.pool_hash_id ), b.epoch_no, b.slot_no, b.block_no, b.time, encode(t.hash, 'hex') AS tx_hash
      FROM delegation sd
          JOIN public.tx t ON t.id = sd.tx_id
          JOIN public.block b ON b.id = t.block_id
      WHERE sd.addr_id = (SELECT id FROM address)
      ORDER BY b.block_no DESC
          LIMIT 1
          )

      SELECT
          json_build_object(
                  'delegation', json_build_object(
                          'drep', (SELECT json_agg(latest_delegation) FROM latest_delegation),
                          'pool',(SELECT json_agg(latest_pool_delegation) FROM latest_pool_delegation)
                                )
          ) AS result;
  ` as Record<string,any>[];

  return res.status(200).json(result[0].result);
};

router.get('/', handlerWrapper(getDelegation));

export default router;

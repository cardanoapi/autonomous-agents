import { Request, Response, Router } from "express";
import { prisma } from '../config/db';
import { handlerWrapper } from "../errors/AppError";

const router = Router();

const getStakeAddress = async (req: Request, res: Response): Promise<any> => {
  const address = req.query.address as string;

  // If you need to decode bech32 addresses, do that here.
  // Example (assuming you have a function decodeBech32):
  // const decodedAddress = decodeBech32(address);

  const result  = await prisma.$queryRaw`
    WITH address AS (
      SELECT * 
      FROM stake_address 
      WHERE hash_raw = decode(${address}, 'hex')
    ),
    latest_registration AS (
      SELECT b.epoch_no, b.slot_no, b.block_no,b.time, encode(t.hash,'hex') as "txHash"
      FROM stake_registration sr
      JOIN public.tx t ON t.id = sr.tx_id
      JOIN public.block b ON b.id = t.block_id
      WHERE sr.addr_id = (SELECT id FROM address)
      ORDER BY b.block_no DESC
      LIMIT 1
    ),
    latest_deregistration AS (
      SELECT b.epoch_no, b.slot_no, b.block_no,b.time, encode(t.hash,'hex') as "txHash"
      FROM stake_deregistration sd
      JOIN public.tx t ON t.id = sd.tx_id
      JOIN public.block b ON b.id = t.block_id
      WHERE sd.addr_id = (SELECT id FROM address)
      ORDER BY b.block_no DESC
      LIMIT 1
    )
    SELECT 
      json_build_object(
        'registration', (SELECT json_agg(latest_registration) FROM latest_registration),
        'deregistration', (SELECT json_agg(latest_deregistration) FROM latest_deregistration)
      ) as data;
  ` as Record<string,any>[];

  res.status(200).json(result[0].data);
};

router.get('/', handlerWrapper(getStakeAddress));

export default router;

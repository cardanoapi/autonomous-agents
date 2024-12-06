import { prisma } from "../config/db";

export const fetchFaucetBalance= async (address:string)=>{
  const result  = await prisma.$queryRaw`
      SELECT COALESCE(SUM(utxo_view.value::numeric), 0) + COALESCE(SUM(reward_rest.amount), 0) AS total_value
      FROM stake_address
               JOIN utxo_view ON utxo_view.stake_address_id = stake_address.id
               LEFT JOIN reward_rest ON reward_rest.addr_id = stake_address.id
      WHERE reward_rest.earned_epoch IS NULL AND
          stake_address.hash_raw = decode(${address}, 'hex')
      GROUP BY stake_address.hash_raw
  ` as Array<Record<string, number>>
  return result.length?+result[0].total_value:0
}

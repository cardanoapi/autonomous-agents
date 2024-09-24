import { prisma } from "../config/db";

export const fetchFaucetBalance= async (address:string)=>{
  const result  = await prisma.$queryRaw`
      select coalesce(sum(utxo_view.value), 0) as balance
      from stake_address
               join utxo_view
                    on utxo_view.stake_address_id = stake_address.id
      where stake_address.hash_raw = decode(${address}, 'hex')
      group by stake_address.hash_raw;
  ` as Array<Record<string, number>>
  return result.length?+result[0].balance:0
}
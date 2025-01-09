import { prisma } from '../config/db'

export const fetchDelegationDetail=async (address:string)=>{
  const result  = await prisma.$queryRaw`
      WITH address AS (
          SELECT *
          FROM stake_address
          WHERE hash_raw = decode(${address}, 'hex')
      ),    
          latest_delegation AS (
      SELECT (select view from drep_hash where id = sd.drep_hash_id) drep_id, b.epoch_no, b.slot_no, b.block_no, b.time, encode(t.hash, 'hex') AS tx_hash
      FROM delegation_vote sd
          JOIN public.tx t ON t.id = sd.tx_id
          JOIN public.block b ON b.id = t.block_id
      WHERE sd.addr_id = (SELECT id FROM address)
      ORDER BY b.block_no DESC
          LIMIT 1
          ),
          latest_pool_delegation AS (
      SELECT (select view from pool_hash where id=sd.pool_hash_id ) pool_id, b.epoch_no, b.slot_no, b.block_no, b.time, encode(t.hash, 'hex') AS tx_hash
      FROM delegation sd
          JOIN public.tx t ON t.id = sd.tx_id
          JOIN public.block b ON b.id = t.block_id
      WHERE sd.addr_id = (SELECT id FROM address)
      ORDER BY b.block_no DESC
          LIMIT 1
          )

      SELECT
          json_build_object(
                          'drep', (SELECT row_to_json(latest_delegation) FROM latest_delegation),
                          'pool',(SELECT row_to_json(latest_pool_delegation) FROM latest_pool_delegation)
          ) AS result;
  ` as Record<string,any>[];
    return result[0].result
}

export async function fetchDelegationRewardBalance(stakeaddressid: bigint) {
    const result = (await prisma.$queryRaw`
      SELECT 
        (SELECT SUM(amount) 
         FROM reward r
         WHERE r.addr_id = ${stakeaddressid}
           AND r.earned_epoch > 
             (SELECT blka.epoch_no
              FROM withdrawal w
              JOIN tx txa ON txa.id = w.tx_id
              JOIN block blka ON blka.id = txa.block_id
              WHERE w.addr_id = ${stakeaddressid}
              ORDER BY w.tx_id DESC
              LIMIT 1)) AS rewardBalance,
  
        (SELECT SUM(amount) 
         FROM reward_rest r
         WHERE r.addr_id = ${stakeaddressid}
           AND r.earned_epoch > 
             (SELECT blka.epoch_no
              FROM withdrawal w
              JOIN tx txa ON txa.id = w.tx_id
              JOIN block blka ON blka.id = txa.block_id
              WHERE w.addr_id = ${stakeaddressid}
              ORDER BY w.tx_id DESC
              LIMIT 1)) AS rewardRestBalance`) as Record<string, any>[]
    return result[0]
}

import { prisma } from '../config/db'


// export const fetchLiveToalStake = async () => {
//     const result = (await prisma.$queryRaw`
//         WITH liveRecord AS (WITH latest AS (
//             WITH stakes AS (
//                 SELECT DISTINCT sa.id AS id, sa.view AS stakeAddress
//                 FROM delegation_vote dv
//                 JOIN drep_hash dh ON dh.id = dv.drep_hash_id
//                 JOIN stake_address sa ON sa.id = dv.addr_id
//                 WHERE dh.raw = DECODE(${drepId}, 'hex')
//             )
//             SELECT 
//                 stakes.stakeAddress,
//                 stakes.id
//             FROM stakes
//             JOIN LATERAL (
//                 SELECT 
//                     ENCODE(tx.hash, 'hex') AS tx_id,
//                     b.epoch_no,
//                     b.time,
//                     dh.raw AS raw_check
//                 FROM delegation_vote dv
//                 JOIN drep_hash dh ON dh.id = dv.drep_hash_id
//                 JOIN tx ON tx.id = dv.tx_id
//                 JOIN block b ON b.id = tx.block_id
//                 WHERE dv.addr_id = stakes.id
//                 ORDER BY dv.tx_id DESC
//                 LIMIT 1
//             ) AS subquery ON subquery.raw_check = DECODE(${drepId}, 'hex')
//             GROUP BY stakes.stakeAddress, stakes.id
//             ORDER BY stakes.id
//         )
//         SELECT 
//             COUNT(DISTINCT(latest.stakeAddress)) AS activeDelegators,
//             COALESCE(SUM(uv.value), 0) + 
//             COALESCE((
//                 SELECT SUM(amount) 
//                 FROM reward r
//                 WHERE r.addr_id = latest.id
//                 AND r.earned_epoch > 
//                     (SELECT blka.epoch_no
//                     FROM withdrawal w
//                     JOIN tx txa ON txa.id = w.tx_id
//                     JOIN block blka ON blka.id = txa.block_id
//                     WHERE w.addr_id = latest.id
//                     ORDER BY w.tx_id DESC
//                     LIMIT 1)
//             ), 0) +
//             COALESCE((
//                 SELECT SUM(amount) 
//                 FROM reward_rest r
//                 WHERE r.addr_id = latest.id
//                 AND r.earned_epoch > 
//                     (SELECT blka.epoch_no
//                     FROM withdrawal w
//                     JOIN tx txa ON txa.id = w.tx_id
//                     JOIN block blka ON blka.id = txa.block_id
//                     WHERE w.addr_id = latest.id
//                     ORDER BY w.tx_id DESC
//                     LIMIT 1)
//             ), 0) AS liveVotingPower
//         FROM latest
//         LEFT JOIN utxo_view uv ON uv.stake_address_id = latest.id
//         GROUP BY latest.stakeAddress, latest.id)
//         SELECT SUM(activedelegators) as activeDelegators, SUM(livevotingpower) as liveVotingPower 
//         FROM liveRecord
//     `) as Record<string, any>[]

//     const latestEpoch = await prisma.epoch.findFirst({
//         orderBy: {
//             start_time: 'desc',
//         },
//         select: {
//             no: true,
//         },
//     })
//     const drepDistr = await prisma.drep_distr.aggregate({
//         _sum: {
//             amount: true,
//         },
//         where: {
//             epoch_no: latestEpoch ? (latestEpoch.no as number) : 0,
//         },
//     })
//     const totalVotingPower = drepDistr._sum.amount as bigint
//     const decimalInfluence = Number(result[0].livevotingpower) / Number(totalVotingPower)
//     const influence = (decimalInfluence * 100).toFixed(4) + '%'
//     const response = {
//         liveDelegators: result[0].activedelegators ? parseInt(result[0].activedelegators) : 0,
//         liveVotingPower: result[0].livevotingpower ? result[0].livevotingpower.toString() : '0',
//         influence: influence,
//     }
//     return response
// }

export async function fetchActiveToalStake() {
    const latestEpoch = await prisma.epoch.findFirst({
        orderBy: {
            start_time: 'desc',
        },
        select: {
            no: true,
        },
    })
    const drepDistr = await prisma.drep_distr.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            epoch_no: latestEpoch ? (latestEpoch.no as number) : 0,
        },
    })
    const totalVotingPower = drepDistr._sum.amount as bigint
    return totalVotingPower.toString()
}

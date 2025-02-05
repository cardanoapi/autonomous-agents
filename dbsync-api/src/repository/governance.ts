import { prisma } from '../config/db'

export async function fetchLiveTotalStake() {
    const result = (await prisma.$queryRaw`
        SELECT SUM(total_value) AS live_stake
        FROM (
            SELECT 
                COALESCE(SUM(utxo_view.value::numeric), 0) + 
                COALESCE(SUM(reward_rest.amount), 0) + 
                COALESCE(SUM(reward.amount), 0)
                AS total_value
            FROM stake_address sa
            JOIN delegation_vote dv ON dv.addr_id = sa.id
            JOIN utxo_view ON utxo_view.stake_address_id = sa.id
            LEFT JOIN reward_rest ON reward_rest.addr_id = sa.id
            LEFT JOIN reward ON reward.addr_id = sa.id
            WHERE reward_rest.earned_epoch IS NULL
            GROUP BY sa.hash_raw, sa.view
        ) AS grouped_values`) as Record<string, any>
    return result[0].live_stake;
}

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

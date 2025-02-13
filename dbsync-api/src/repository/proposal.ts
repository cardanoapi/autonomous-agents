import { Prisma } from '@prisma/client'
import { prisma } from '../config/db'
import { formatResult } from '../helpers/formatter'
import { ProposalTypes, SortTypes } from '../types/proposal'

export const fetchProposals = async (
    page: number,
    size: number,
    proposal?: string,
    proposalType?: ProposalTypes,
    sort?: SortTypes
) => {
    const result = (await prisma.$queryRaw`
WITH LatestDrepDistr AS (
    SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY hash_id ORDER BY epoch_no DESC) AS rn
    FROM
        drep_distr
),
     EpochUtils AS (
         SELECT
             (Max(end_time) - Min(end_time)) /(Max(NO) - Min(NO)) AS epoch_duration,
             Max(NO) AS last_epoch_no,
             Max(end_time) AS last_epoch_end_time
         FROM
             epoch
     ),
     always_no_confidence_voting_power AS (
         SELECT
             coalesce((
                          SELECT
                              amount
                          FROM drep_hash
                                   LEFT JOIN drep_distr ON drep_hash.id = drep_distr.hash_id
                          WHERE
                              drep_hash.view = 'drep_always_no_confidence' ORDER BY epoch_no DESC LIMIT 1), 0) AS amount
     ),
     always_abstain_voting_power AS (
         SELECT
             coalesce((
                          SELECT
                              amount
                          FROM drep_hash
                                   LEFT JOIN drep_distr ON drep_hash.id = drep_distr.hash_id
                          WHERE
                              drep_hash.view = 'drep_always_abstain' ORDER BY epoch_no DESC LIMIT 1), 0) AS amount
     )
SELECT
    json_build_object(
       'id', gov_action_proposal.id,
    'txHash',encode(creator_tx.hash, 'hex'),
    'index', gov_action_proposal.index,
    'type', gov_action_proposal.type::text,
    'details', CASE
                    when gov_action_proposal.type = 'TreasuryWithdrawals' then
                    json_build_object('Reward Address', stake_address.view, 'Amount', treasury_withdrawal.amount)
                    when gov_action_proposal.type::text = 'InfoAction' then
                        json_build_object()
                    when gov_action_proposal.type::text = 'HardForkInitiation' then
                        json_build_object(
                                'major', (gov_action_proposal.description->'contents'->1->>'major')::int,
                                'minor', (gov_action_proposal.description->'contents'->1->>'minor')::int
                        )
                    ELSE
                        null
                   END,
    'expiryDate', epoch_utils.last_epoch_end_time + epoch_utils.epoch_duration * (gov_action_proposal.expiration - epoch_utils.last_epoch_no),
    'expiryEpochNon', gov_action_proposal.expiration,
    'createdDate', creator_block.time,
    'createdEpochNo', creator_block.epoch_no,
    'url', voting_anchor.url,
    'metadataHash', encode(voting_anchor.data_hash, 'hex'),
    'protocolParams', ROW_TO_JSON(proposal_params),
    'title',  off_chain_vote_gov_action_data.title,
    'abstract', off_chain_vote_gov_action_data.abstract,
    'motivation', off_chain_vote_gov_action_data.motivation,
    'rationale', off_chain_vote_gov_action_data.rationale,
    'dRepYesVotes',  coalesce(Sum(ldd_drep.amount) FILTER (WHERE voting_procedure.vote::text = 'Yes'), 0) +(
        CASE WHEN gov_action_proposal.type = 'NoConfidence' THEN
                 always_no_confidence_voting_power.amount
             ELSE
                 0
            END),
    'dRepNoVotes', coalesce(Sum(ldd_drep.amount) FILTER (WHERE voting_procedure.vote::text = 'No'), 0) +(
        CASE WHEN gov_action_proposal.type = 'NoConfidence' THEN
                 0
             ELSE
                 always_no_confidence_voting_power.amount
            END),
    'dRepAbstainVotes', coalesce(Sum(ldd_drep.amount) FILTER (WHERE voting_procedure.vote::text = 'Abstain'), 0) + always_abstain_voting_power.amount,
    'poolYesVotes', coalesce(vp_by_pool.poolYesVotes, 0),
    'poolNoVotes', coalesce(vp_by_pool.poolNoVotes, 0),
    'poolAbstainVotes', coalesce (vp_by_pool.poolAbstainVotes, 0),
    'ccYesVotes', coalesce(vp_by_cc.ccYesVotes, 0),
    'ccNoVotes', coalesce(vp_by_cc.ccNoVotes, 0),
    'ccAbstainVotes', coalesce(vp_by_cc.ccAbstainVotes, 0),
    'prevGovActionIndex', prev_gov_action.index,
    'prevGovActionTxHash', encode(prev_gov_action_tx.hash, 'hex')
    ) AS result,
    COUNT(*) OVER () AS total_count
FROM
    gov_action_proposal
        LEFT JOIN treasury_withdrawal
                  on gov_action_proposal.id = treasury_withdrawal.gov_action_proposal_id
        LEFT JOIN stake_address
                  on stake_address.id = treasury_withdrawal.stake_address_id
        CROSS JOIN EpochUtils AS epoch_utils
        CROSS JOIN always_no_confidence_voting_power
        CROSS JOIN always_abstain_voting_power
        JOIN tx AS creator_tx ON creator_tx.id = gov_action_proposal.tx_id
        JOIN block AS creator_block ON creator_block.id = creator_tx.block_id
        LEFT JOIN voting_anchor ON voting_anchor.id = gov_action_proposal.voting_anchor_id
        LEFT JOIN param_proposal as proposal_params ON gov_action_proposal.param_proposal = proposal_params.id
        LEFT JOIN off_chain_vote_data ON off_chain_vote_data.voting_anchor_id = voting_anchor.id
        LEFT JOIN off_chain_vote_gov_action_data ON off_chain_vote_gov_action_data.off_chain_vote_data_id = off_chain_vote_data.id
        LEFT JOIN voting_procedure ON voting_procedure.gov_action_proposal_id = gov_action_proposal.id
        LEFT JOIN LatestDrepDistr ldd_drep ON ldd_drep.hash_id = voting_procedure.drep_voter
        AND ldd_drep.rn = 1
        LEFT JOIN
    (
        SELECT
            gov_action_proposal_id,
            SUM(CASE WHEN vote = 'Yes' THEN 1 ELSE 0 END) AS poolYesVotes,
            SUM(CASE WHEN vote = 'No' THEN 1 ELSE 0 END) AS poolNoVotes,
            SUM(CASE WHEN vote = 'Abstain' THEN 1 ELSE 0 END) AS poolAbstainVotes
        FROM
            voting_procedure
        WHERE
            pool_voter IS NOT NULL
        GROUP BY
            gov_action_proposal_id
    ) vp_by_pool
    ON gov_action_proposal.id = vp_by_pool.gov_action_proposal_id
        LEFT JOIN
    (
        SELECT
            gov_action_proposal_id,
            SUM(CASE WHEN vote = 'Yes' THEN 1 ELSE 0 END) AS ccYesVotes,
            SUM(CASE WHEN vote = 'No' THEN 1 ELSE 0 END) AS ccNoVotes,
            SUM(CASE WHEN vote = 'Abstain' THEN 1 ELSE 0 END) AS ccAbstainVotes
        FROM
            voting_procedure
        WHERE
            committee_voter IS NOT NULL
        GROUP BY
            gov_action_proposal_id
    ) vp_by_cc
    ON gov_action_proposal.id = vp_by_cc.gov_action_proposal_id

        LEFT JOIN LatestDrepDistr ldd_cc ON ldd_cc.hash_id = voting_procedure.committee_voter
        AND ldd_cc.rn = 1
        LEFT JOIN gov_action_proposal AS prev_gov_action ON gov_action_proposal.prev_gov_action_proposal = prev_gov_action.id
        LEFT JOIN tx AS prev_gov_action_tx ON prev_gov_action.tx_id = prev_gov_action_tx.id
  AND gov_action_proposal.ratified_epoch IS NULL
  AND gov_action_proposal.enacted_epoch IS NULL
  AND gov_action_proposal.expired_epoch IS NULL
  AND gov_action_proposal.dropped_epoch IS NULL 
${
    proposalType
        ? Prisma.sql`Where gov_action_proposal.type = ${Prisma.raw(`'${proposalType}'::govactiontype`)}`
        : Prisma.sql``
} 
GROUP BY
    (gov_action_proposal.id,
     stake_address.view,
     treasury_withdrawal.amount,
     creator_block.epoch_no,
     off_chain_vote_gov_action_data.title,
     off_chain_vote_gov_action_data.abstract,
     off_chain_vote_gov_action_data.motivation,
     off_chain_vote_gov_action_data.rationale,
     vp_by_pool.poolYesVotes,
     vp_by_pool.poolNoVotes,
     vp_by_pool.poolAbstainVotes,
     vp_by_cc.ccYesVotes,
     vp_by_cc.ccNoVotes,
     vp_by_cc.ccAbstainVotes,
     gov_action_proposal.index,
     creator_tx.hash,
     creator_block.time,
     epoch_utils.epoch_duration,
     epoch_utils.last_epoch_no,
     epoch_utils.last_epoch_end_time,
     proposal_params,
     voting_anchor.url,
     voting_anchor.data_hash,
     always_no_confidence_voting_power.amount,
     always_abstain_voting_power.amount,
     prev_gov_action.index,
     prev_gov_action_tx.hash) 
  ${proposal ? Prisma.sql`HAVING creator_tx.hash = decode(${proposal},'hex')` : Prisma.sql``}
  ${
      sort === 'ExpiryDate'
          ? Prisma.sql`ORDER BY epoch_utils.last_epoch_end_time + epoch_utils.epoch_duration * (gov_action_proposal.expiration - epoch_utils.last_epoch_no) DESC`
          : Prisma.sql`ORDER BY creator_block.time DESC`
  }
  OFFSET ${(page ? page - 1 : 0) * (size ? size : 10)}
  FETCH NEXT ${size ? size : 10} ROWS ONLY
  `) as Record<any, any>[]
    const totalCount = result.length ? Number(result[0].total_count) : 0
    return { items: formatResult(result), totalCount }
}

// /api/propopsals/${id}/vote-count
export const fetchProposalVoteCount = async (proposalId: string, proposalIndex: number) => {
    const result = (await prisma.$queryRaw`WITH govAction AS (
                SELECT g.id
                FROM gov_action_proposal g
                JOIN tx ON tx.id = g.tx_id
                WHERE tx.hash = DECODE(${proposalId}, 'hex')
                AND g.index = ${proposalIndex}
            )
            SELECT COUNT(vp.id) 
            FROM voting_procedure vp 
            JOIN govAction ON vp.gov_action_proposal_id = govAction.id;
        `) as Record<string, any>
    return parseInt(result[0].count)
}

export const fetchProposalVotes = async (
    proposalId: string,
    proposalIndex: number,
    includeVotingPower?: boolean | false
) => {
    let results
    if (includeVotingPower) {
        results = (await prisma.$queryRaw`
        WITH govAction AS (
            SELECT 
                g.id, 
                g.expiration
            FROM gov_action_proposal g
            JOIN tx ON tx.id = g.tx_id
            WHERE tx.hash = DECODE(
                ${proposalId}, 
                'hex'
            )
            AND g.index = ${proposalIndex}
        ),
        latestEpoch AS (
            SELECT 
                e.no AS latest_no 
            FROM epoch e 
            ORDER BY e.no DESC 
            LIMIT 1
        )
        SELECT 
            govAction.expiration AS expirationEpoch,
            latestEpoch.latest_no AS latestEpoch,
            vp.voter_role AS voterRole,
            CASE 
                WHEN vp.drep_voter IS NOT NULL THEN 
                    jsonb_build_object(
                        'credential', ENCODE(dh.raw, 'hex'),
                        'hasScript', dh.has_script,
                        'votingPower', (
                            SELECT dr.amount 
                            FROM drep_distr dr 
                            WHERE dr.hash_id = vp.drep_voter 
                            AND epoch_no = (
                                SELECT LEAST(latest_no, govAction.expiration) 
                                FROM latestEpoch
                            )
                        )
                    )
                WHEN vp.pool_voter IS NOT NULL THEN 
                    jsonb_build_object(
                        'credential', ENCODE(ph.hash_raw, 'hex'),
                        'votingPower', (
                            SELECT ps.voting_power 
                            FROM pool_stat ps 
                            WHERE ps.pool_hash_id = vp.pool_voter
                            AND ps.epoch_no = (
                                SELECT LEAST(latest_no, govAction.expiration)
                                FROM latestEpoch
                            )
                        )
                    )
                WHEN vp.committee_voter IS NOT NULL THEN 
                    jsonb_build_object(
                        'credential', ENCODE(ch.raw, 'hex'),
                        'hasScript', ch.has_script
                    )
                ELSE NULL
            END AS voterInfo, 
            vp.vote AS vote,
            b.time AS time,
            ENCODE(b.hash, 'hex') AS block,
            b.block_no AS blockNo,
            b.epoch_no AS epoch,
            b.slot_no AS blockSlot,
            ENCODE(tx.hash, 'hex') AS tx,
            txo.index AS index
        FROM voting_procedure vp
        JOIN govAction 
            ON vp.gov_action_proposal_id = govAction.id
        JOIN tx 
            ON tx.id = vp.tx_id
        JOIN block b 
            ON b.id = tx.block_id
        JOIN tx_out txo 
            ON txo.tx_id = tx.id
        LEFT JOIN drep_hash dh 
            ON dh.id = vp.drep_voter
        LEFT JOIN pool_hash ph 
            ON ph.id = vp.pool_voter
        LEFT JOIN committee_hash ch 
            ON ch.id = vp.committee_voter
        JOIN latestEpoch 
            ON True
        ORDER BY b.time DESC;
    `) as Record<string, any>
    } else {
        results = (await prisma.$queryRaw`
            WITH govAction AS (
                SELECT 
                    g.id, 
                    g.expiration
                FROM gov_action_proposal g
                JOIN tx ON tx.id = g.tx_id
                WHERE tx.hash = DECODE(
                    ${proposalId}, 
                    'hex'
                )
                AND g.index = ${proposalIndex}
            ),
            latestEpoch AS (
                SELECT 
                    e.no AS latest_no 
                FROM epoch e 
                ORDER BY e.no DESC 
                LIMIT 1
            )
            SELECT 
                govAction.expiration AS expirationEpoch,
                latestEpoch.latest_no AS latestEpoch,
                vp.voter_role AS voterRole,
                CASE 
                    WHEN vp.drep_voter IS NOT NULL THEN 
                        jsonb_build_object(
                            'credential', ENCODE(dh.raw, 'hex'),
                            'hasScript', dh.has_script
                        )
                    WHEN vp.pool_voter IS NOT NULL THEN 
                        jsonb_build_object(
                            'credential', ENCODE(ph.hash_raw, 'hex')
                        )
                    WHEN vp.committee_voter IS NOT NULL THEN 
                        jsonb_build_object(
                            'credential', ENCODE(ch.raw, 'hex'),
                            'hasScript', ch.has_script
                        )
                    ELSE NULL
                END AS voterInfo, 
                vp.vote AS vote,
                b.time AS time,
                ENCODE(b.hash, 'hex') AS block,
                b.block_no AS blockNo,
                b.epoch_no AS epoch,
                b.slot_no AS blockSlot,
                ENCODE(tx.hash, 'hex') AS tx,
                txo.index AS index
            FROM voting_procedure vp
            JOIN govAction 
                ON vp.gov_action_proposal_id = govAction.id
            JOIN tx 
                ON tx.id = vp.tx_id
            JOIN block b 
                ON b.id = tx.block_id
            JOIN tx_out txo 
                ON txo.tx_id = tx.id
            LEFT JOIN drep_hash dh 
                ON dh.id = vp.drep_voter
            LEFT JOIN pool_hash ph 
                ON ph.id = vp.pool_voter
            LEFT JOIN committee_hash ch 
                ON ch.id = vp.committee_voter
            JOIN latestEpoch 
                ON True
            ORDER BY b.time DESC;
        `) as Record<string, any>
    }

    type VoteRecord = {
        voter: {
            role: string
            credential: string
            hasScript: boolean
            votingPower?: string
        }
        vote: string
        createdAt: {
            time: string
            block: number
            blockHash: string
            epoch: number
            slot: number
            tx: string
            index: number
        }
    }
    const parsedResults: VoteRecord[] = []
    results.forEach((result: Record<string, any>) => {
        const votingPower = includeVotingPower
            ? { votingPower: result.voterinfo.votingPower ? result.voterinfo.votingPower.toString() : '0' }
            : undefined
        const parsedResult: VoteRecord = {
            vote: result.vote,
            voter: {
                role: result.voterrole,
                credential: result.voterinfo.credential,
                hasScript: result.voterinfo.hasScript || false,
                ...votingPower,
            },
            createdAt: {
                time: result.time,
                block: parseInt(result.blockno),
                blockHash: result.block,
                epoch: parseInt(result.epoch),
                slot: parseInt(result.blockslot),
                tx: result.tx,
                index: result.index,
            },
        }
        parsedResults.push(parsedResult)
    })
    return parsedResults
}

import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { formatResult } from "../helpers/formatter";
import { ProposalTypes, SortTypes } from "../types/proposal";

export const fetchProposals=async(page:number,size:number,proposal?:string,proposalType?:ProposalTypes,sort?:SortTypes)=>{
  console.log("pospo: ",proposalType)
  const result = await prisma.$queryRaw `
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
${proposalType?Prisma.sql`Where gov_action_proposal.type = ${Prisma.raw(`'${proposalType}'::govactiontype`)}`:Prisma.sql``} 
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
  ${proposal ? Prisma.sql`HAVING creator_tx.hash = decode(${proposal},'hex')`: Prisma.sql``}
  ${sort==='ExpiryDate'?Prisma.sql`ORDER BY epoch_utils.last_epoch_end_time + epoch_utils.epoch_duration * (gov_action_proposal.expiration - epoch_utils.last_epoch_no) DESC`:Prisma.sql`ORDER BY creator_block.time DESC`}
  OFFSET ${(page?(page-1): 0) * (size?size:10)}
  FETCH NEXT ${size?size:10} ROWS ONLY
  ` as Record<any,any>[]
  const totalCount = result.length?Number(result[0].total_count):0
  return {items:formatResult(result),totalCount}
}
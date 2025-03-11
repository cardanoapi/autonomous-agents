import { Prisma } from '@prisma/client'
import { prisma } from '../config/db'
import { formatResult } from '../helpers/formatter'
import { ProposalTypes, SortTypes } from '../types/proposal'

export const fetchProposals = async (
    page: number,
    size: number,
    proposal?: string,
    proposalType?: ProposalTypes,
    sort?: SortTypes,
    includeVoteCount?: boolean
) => {
    const result = (await prisma.$queryRaw`
    WITH LatestDrepDistr AS (
        SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY hash_id ORDER BY epoch_no DESC) AS rn
        FROM
            drep_distr
    ),
    CommitteeData AS (
        SELECT DISTINCT ON (ch.raw)
            encode(ch.raw, 'hex') AS hash,
            cm.expiration_epoch,
            ch.has_script
        FROM
            committee_member cm
        JOIN committee_hash ch ON cm.committee_hash_id = ch.id
        ORDER BY
            ch.raw, cm.expiration_epoch DESC
    ),
    ParsedDescription AS (
        SELECT
            gov_action_proposal.id,
            description->'tag' AS tag,
            description->'contents'->1 AS members_to_be_removed,
            description->'contents'->2 AS members,
            description->'contents'->3 AS threshold
        FROM
            gov_action_proposal
        WHERE
            gov_action_proposal.type = 'NewCommittee'
    ),
    MembersToBeRemoved AS (
    SELECT
        id,
        json_agg(VALUE->>'keyHash') AS members_to_be_removed
    FROM
        ParsedDescription pd,
        json_array_elements(members_to_be_removed::json) AS value
    GROUP BY
        id
    ),
    ProcessedCurrentMembers AS (
        SELECT
            pd.id,
            json_agg(
                json_build_object(
                    'hash', regexp_replace(kv.key, '^keyHash-', ''),
                    'newExpirationEpoch', kv.value::int
                )
            ) AS current_members
        FROM
            ParsedDescription pd,
            jsonb_each_text(pd.members) AS kv(key, value)
        GROUP BY
            pd.id
    ),
    EnrichedCurrentMembers AS (
        SELECT
            pcm.id,
            json_agg(
                json_build_object(
                    'hash', cm.hash,
                    'expirationEpoch', cm.expiration_epoch,
                    'hasScript', cm.has_script,
                    'newExpirationEpoch', (member->>'newExpirationEpoch')::int
                )
            ) AS enriched_members
        FROM
            ProcessedCurrentMembers pcm
        LEFT JOIN json_array_elements(pcm.current_members) AS member ON true
        LEFT JOIN CommitteeData cm 
            ON (CASE 
                WHEN (member->>'hash') ~ '^[0-9a-fA-F]+$' 
                THEN encode(decode(member->>'hash', 'hex'), 'hex') 
                ELSE NULL 
            END) = cm.hash
        GROUP BY
            pcm.id
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
                        (
                            SELECT json_agg(
                                jsonb_build_object(
                                    'receivingAddress', stake_address.view,
                                    'amount', treasury_withdrawal.amount
                                )
                            )
                            FROM treasury_withdrawal
                            LEFT JOIN stake_address
                                ON stake_address.id = treasury_withdrawal.stake_address_id
                            WHERE treasury_withdrawal.gov_action_proposal_id = gov_action_proposal.id
                        )
                        when gov_action_proposal.type::text = 'InfoAction' then
                            json_build_object('data', gov_action_proposal.description)
                        when gov_action_proposal.type::text = 'HardForkInitiation' then
                            json_build_object(
                                    'major', (gov_action_proposal.description->'contents'->1->>'major')::int,
                                    'minor', (gov_action_proposal.description->'contents'->1->>'minor')::int
                            )
                        WHEN gov_action_proposal.type::text = 'NoConfidence' THEN
                            json_build_object('data', gov_action_proposal.description->'contents')
                        WHEN gov_action_proposal.type::text = 'ParameterChange' THEN
                            json_build_object('data', gov_action_proposal.description->'contents')
                        WHEN gov_action_proposal.type::text = 'NewConstitution' THEN
                            json_build_object(
                                'anchor', gov_action_proposal.description->'contents'->1->'anchor',
                                'script', gov_action_proposal.description->'contents'->1->'script'
                            )
                        WHEN gov_action_proposal.type::text = 'NewCommittee' THEN
                            (
                                SELECT
                                    json_build_object(
                                        'tag', pd.tag,
                                        'members', em.enriched_members,
                                        'membersToBeRemoved', mtr.members_to_be_removed,
                                        'threshold', 
                                            CASE 
                                                WHEN (pd.threshold->>'numerator') IS NOT NULL 
                                                AND (pd.threshold->>'denominator') IS NOT NULL 
                                                THEN (pd.threshold->>'numerator')::float / (pd.threshold->>'denominator')::float
                                                ELSE NULL 
                                            END
                                    )
                                FROM
                                    ParsedDescription pd
                                JOIN
                                    MembersToBeRemoved mtr ON pd.id = mtr.id
                                JOIN
                                    EnrichedCurrentMembers em ON pd.id = em.id
                                WHERE
                                    pd.id = gov_action_proposal.id
                            )
                        ELSE
                            null
                    END,
    'status', CASE 
                    when gov_action_proposal.enacted_epoch is not NULL then json_build_object('enactedEpoch', gov_action_proposal.enacted_epoch)
                    when gov_action_proposal.ratified_epoch is not NULL then json_build_object('ratifiedEpoch', gov_action_proposal.ratified_epoch)
                    when gov_action_proposal.expired_epoch is not NULL then json_build_object('expiredEpoch', gov_action_proposal.expired_epoch)
                    else NULL
                END,
    'expiryDate', epoch_utils.last_epoch_end_time + epoch_utils.epoch_duration * (gov_action_proposal.expiration - epoch_utils.last_epoch_no),
    'expiryEpochNon', gov_action_proposal.expiration,
    'createdDate', creator_block.time,
    'createdBlockHash', encode(creator_block.hash, 'hex'),
    'createdBlockNo', creator_block.block_no,
    'createdEpochNo', creator_block.epoch_no,
    'createdSlotNo', creator_block.slot_no,
    'url', voting_anchor.url,
    'metadataHash', encode(voting_anchor.data_hash, 'hex'),
    'protocolParams', jsonb_set(
            ROW_TO_JSON(proposal_params)::jsonb,
                            '{cost_model}', 
                            CASE
                                WHEN cost_model.id IS NOT NULL THEN
                                    ROW_TO_JSON(cost_model)::jsonb
                                ELSE
                                    'null'::jsonb
                            END
                        ),
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
        LEFT JOIN cost_model AS cost_model ON proposal_params.cost_model_id = cost_model.id
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
     creator_block.hash,
     creator_block.block_no,
     creator_block.slot_no,
     epoch_utils.epoch_duration,
     epoch_utils.last_epoch_no,
     epoch_utils.last_epoch_end_time,
     proposal_params,
     cost_model.id,
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
    const parsedResults: any[] = []
    for (const res of result) {
        const resultData = res.result
        const proposalVoteCount = includeVoteCount
            ? { vote: await fetchProposalVoteCount(resultData.txHash, resultData.index) }
            : undefined
        const parsedResult = {
            proposal: {
                type: resultData.type,
                details: resultData.details,
                metadataUrl: resultData.url,
                metadataHash: resultData.metadataHash,
            },
            meta: {
                protocolParams: resultData.protocolParams,
                title: resultData.title,
                abstract: resultData.abstract,
                motivation: resultData.motivation,
                rationale: resultData.rationale,
            },
            createdAt: {
                time: resultData.createdDate,
                block: parseInt(resultData.createdBlockNo),
                blockHash: resultData.createdBlockHash,
                epoch: parseInt(resultData.createdEpochNo),
                slot: parseInt(resultData.createdSlotNo),
                tx: resultData.txHash,
                index: parseInt(resultData.index),
            },
            expireAt: {
                time: resultData.expiryDate,
                epoch: parseInt(resultData.expiryEpochNon),
            },
            status: resultData.status,
            ...proposalVoteCount,
        }

        parsedResults.push(parsedResult)
    }

    return { items: parsedResults, totalCount }
}

// /api/propopsals/${id}/vote-count
export const fetchProposalVoteCount = async (proposalId: string, proposalIndex: number, voter?: string) => {
    const drepVoteQuery = Prisma.sql`
        , drepVoteRecord AS (
            WITH epochDreps AS (
                -- Get the latest DRep distribution for the selected epoch
                SELECT * 
                FROM drep_distr ddr
                WHERE ddr.epoch_no = (SELECT epoch FROM latestOrGovActionExpiration)
            ),
        
            abstainAndNoConfidenceDreps AS (
                -- Get voting power for "always abstain" and "always no confidence" Dreps
                SELECT DISTINCT 
                    dr.hash_id,
                    dh.view AS drepType,
                    COALESCE(
                        (SELECT dr_inner.amount
                        FROM drep_distr dr_inner
                        WHERE dr_inner.hash_id = dr.hash_id
                        AND dr_inner.epoch_no = (SELECT epoch FROM latestOrGovActionExpiration)
                        ), 0
                    ) AS latestVotingPower
                FROM drep_distr dr
                JOIN drep_hash dh ON dh.id = dr.hash_id
                WHERE dr.epoch_no BETWEEN (SELECT submittedEpoch FROM ga)
                    AND (SELECT expirationEpoch FROM ga)
                    AND dh.view IN ('drep_always_abstain', 'drep_always_no_confidence')
            ),
        
            inactiveDreps AS (
                -- Calculate the total voting power of inactive Dreps
                SELECT 
                    SUM(amount) AS amnt,
                    COUNT(DISTINCT epochDreps.hash_id) AS count
                FROM epochDreps
                LEFT JOIN govActionVotes ON govActionVotes.drep_voter = epochDreps.hash_id
                WHERE active_until > (SELECT expirationEpoch FROM ga)
                AND govActionVotes.voter_role IS NULL
            ),
        
            votePowers AS (
                -- Calculate the total voting power for each vote option
                SELECT  
                    govActionVotes.vote,
                    SUM(epochDreps.amount) AS power,
                    COUNT(DISTINCT epochDreps.hash_id) AS count
                FROM govActionVotes
                JOIN epochDreps ON epochDreps.hash_id = govActionVotes.drep_voter
                GROUP BY govActionVotes.vote
            )
        
            -- Final union query to get all voting statistics
            SELECT 
                text(votePowers.vote) AS vote_type, 
                votePowers.power,
                votePowers.count
            FROM votePowers
        
            UNION
        
            SELECT 
                drep_hash.view, 
                epochDreps.amount,
                COUNT(DISTINCT drep_hash.id) AS count
            FROM drep_hash
            JOIN epochDreps ON drep_hash.id = epochDreps.hash_id
            WHERE drep_hash.view IN ('drep_always_abstain', 'drep_always_no_confidence')
            GROUP BY drep_hash.view, epochDreps.amount
        
            UNION  
        
            SELECT 
                'total_distribution', 
                (SELECT SUM(amount) FROM epochDreps),
                (SELECT COUNT(DISTINCT hash_id) FROM epochDreps)
        
            UNION 
        
            SELECT 
                'inactive_votes', 
                (SELECT amnt FROM inactiveDreps),
                (SELECT count FROM inactiveDreps)
        )    
    `
    const drepSelectionQuery = Prisma.sql`SELECT 'drep' AS voterRole, (SELECT jsonb_agg(to_jsonb(drepVoteRecord)) FROM drepVoteRecord) AS voteRecord`
    const spoVoteQuery = Prisma.sql`
        , poolVoteRecord AS (
            WITH epochSPOs AS (
                -- Get the latest stake pool operator distribution for the selected epoch
                SELECT * 
                FROM pool_stat ps
                WHERE ps.epoch_no = (SELECT epoch FROM latestOrGovActionExpiration)
            ),
        
            votePowers AS (
                -- Calculate the total voting power for each vote option
                SELECT  
                    govActionVotes.vote,
                    SUM(epochSPOs.voting_power) AS power,
                    COUNT(DISTINCT epochSPOs.pool_hash_id) AS count
                FROM govActionVotes
                JOIN epochSPOs ON epochSPOs.pool_hash_id = govActionVotes.pool_voter
                GROUP BY govActionVotes.vote
            )
        
            SELECT 
                text(votePowers.vote) AS vote_type, 
                votePowers.power,
                votePowers.count
            FROM votePowers
        
            UNION 
        
            SELECT 
                'total_distribution', 
                (SELECT SUM(voting_power) FROM epochSPOs),
                (SELECT COUNT(DISTINCT pool_hash_id) FROM epochSPOs)
        )
    `
    const spoSelectionQuery = Prisma.sql`SELECT 'spo' AS voterRole, (SELECT jsonb_agg(to_jsonb(poolVoteRecord)) FROM poolVoteRecord) AS voteRecord`
    const ccVoteQuery = Prisma.sql`
        , committeeVoteRecord AS (
            WITH CommitteeVotes AS (
                -- Count committee votes for each vote type
                SELECT 
                    SUM(CASE WHEN vote = 'Yes' THEN 1 ELSE 0 END) AS cc_Yes_Votes,
                    SUM(CASE WHEN vote = 'No' THEN 1 ELSE 0 END) AS cc_No_Votes,
                    SUM(CASE WHEN vote = 'Abstain' THEN 1 ELSE 0 END) AS cc_Abstain_Votes
                FROM voting_procedure AS vp
                JOIN ga ON ga.id = vp.gov_action_proposal_id
                WHERE vp.committee_voter IS NOT NULL
                AND (vp.tx_id, vp.committee_voter, vp.gov_action_proposal_id) IN (
                    SELECT MAX(tx_id), committee_voter, gov_action_proposal_id
                    FROM voting_procedure
                    WHERE committee_voter IS NOT NULL
                    GROUP BY committee_voter, gov_action_proposal_id
                )
                GROUP BY gov_action_proposal_id
            ),
            CommitteeData AS (
                SELECT DISTINCT ON (ch.raw)
                    encode(ch.raw, 'hex') AS hash,
                    cm.expiration_epoch,
                    ch.has_script
                FROM committee_member cm
                JOIN committee_hash ch ON cm.committee_hash_id = ch.id
                WHERE cm.expiration_epoch > (SELECT epoch FROM latestOrGovActionExpiration)
                ORDER BY ch.raw, cm.expiration_epoch DESC
            )
            SELECT 'total_distribution' as vote_type, COUNT(DISTINCT hash) AS count
            FROM CommitteeData
            UNION ALL
            SELECT 'yes_votes' as vote_type, COALESCE(cc_Yes_Votes, 0) AS count FROM CommitteeVotes
            UNION ALL
            SELECT 'no_votes' as vote_type, COALESCE(cc_No_Votes, 0) AS count FROM CommitteeVotes
            UNION ALL
            SELECT 'abstain_votes' as vote_type, COALESCE(cc_Abstain_Votes, 0) AS count FROM CommitteeVotes
        )
    `
    const ccSelectionQuery = Prisma.sql`SELECT 'cc' AS voterRole, (SELECT jsonb_agg(to_jsonb(committeeVoteRecord)) FROM committeeVoteRecord) AS voteRecord`
    const temp = (await prisma.$queryRaw`
    WITH ga AS (
        -- Get governance action details including ID, submitted epoch, and expiration epoch
        SELECT 
            g.id, 
            b.epoch_no AS submittedEpoch, 
            g.expiration AS expirationEpoch
        FROM gov_action_proposal g
        JOIN tx ON tx.id = g.tx_id
        JOIN block b ON b.id = tx.block_id
        WHERE tx.hash = DECODE(
            ${proposalId}, 'hex'
        )
        AND g.index = ${proposalIndex}
    ),
    
    govActionVotes AS (
        -- Get latest votes for each unique voter (DRep, Pool, or Committee) by role
        SELECT 
            rv.voter_role, 
            rv.vote, 
            rv.drep_voter, 
            rv.committee_voter, 
            rv.pool_voter
        FROM (
            SELECT 
                vp.*, 
                t.hash AS tx_hash, 
                b.block_no AS block_no,
                ROW_NUMBER() OVER (
                    PARTITION BY vp.voter_role, 
                    COALESCE(vp.drep_voter, vp.pool_voter, vp.committee_voter) 
                    ORDER BY t.block_id DESC
                ) AS rn
            FROM voting_procedure vp
            JOIN ga ON vp.gov_action_proposal_id = ga.id
            JOIN public.tx t ON t.id = vp.tx_id
            JOIN public.block b ON b.id = t.block_id
            WHERE vp.invalid IS NULL
        ) rv 
        WHERE rn = 1
    ),
    
    latestOrGovActionExpiration AS (
        -- Determine the latest epoch to consider for voting calculations
        SELECT LEAST(
            (SELECT e.no FROM epoch e ORDER BY e.id DESC LIMIT 1),
            (SELECT g.expirationEpoch FROM ga g)
        ) AS epoch
    )

    ${voter === 'drep' || voter === undefined ? Prisma.sql`${drepVoteQuery}` : Prisma.sql``}
    ${voter === 'spo' || voter === undefined ? Prisma.sql`${spoVoteQuery}` : Prisma.sql``}
    ${voter === 'cc' || voter === undefined ? Prisma.sql`${ccVoteQuery}` : Prisma.sql``}
    
    ${voter === 'drep' ? Prisma.sql`${drepSelectionQuery}` : Prisma.sql``}
    ${voter === 'spo' ? Prisma.sql`${spoSelectionQuery}` : Prisma.sql``}
    ${voter === 'cc' ? Prisma.sql`${ccSelectionQuery}` : Prisma.sql``}
    
    ${
        voter == undefined
            ? Prisma.sql`${drepSelectionQuery} UNION ${spoSelectionQuery} UNION ${ccSelectionQuery}`
            : Prisma.sql``
    }

    `) as Record<string, any>
    const tempResult = temp
    type PowerAndCount = {
        power: string | null
        count?: number
    }
    type CCVoteRecord = {
        totalDistribution: number
        yes: number
        no: number
        abstain: number
        notVoted: number
    }
    type Delegators = {
        abstain: PowerAndCount
        noConfidence: PowerAndCount
    }
    type DRepVoteRecord = {
        totalDistribution: PowerAndCount
        yes: PowerAndCount
        no: PowerAndCount
        abstain: PowerAndCount
        inactive: PowerAndCount
        notVoted: PowerAndCount
        delegators: Delegators
    }
    type SPOVoteRecord = {
        totalDistribution: PowerAndCount
        yes: PowerAndCount
        no: PowerAndCount
        abstain: PowerAndCount
        notVoted: PowerAndCount
    }
    let ccVotes: any[] = [],
        spoVotes: any[] = [],
        drepVotes: any[] = []
    let ccVoteRecord: CCVoteRecord | undefined,
        drepVoteRecord: DRepVoteRecord | undefined,
        spoVoteRecord: SPOVoteRecord | undefined
    tempResult.forEach((res: any) => {
        if (res.voterrole == 'cc') {
            ccVotes = res.voterecord ? res.voterecord : []
        }
        if (res.voterrole == 'spo') {
            spoVotes = res.voterecord ? res.voterecord : []
        }
        if (res.voterrole == 'drep') {
            drepVotes = res.voterecord ? res.voterecord : []
        }
    })
    let emptyPowerAndCount: PowerAndCount = { power: null }
    if (ccVotes) {
        let total, yes, no, abstain
        for (const vote of ccVotes) {
            switch (vote.vote_type) {
                case 'total_distribution':
                    total = vote.count
                    break
                case 'yes_votes':
                    yes = vote.count
                    break
                case 'no_votes':
                    no = vote.count
                    break
                case 'abstain_votes':
                    abstain = vote.count
                    break
                default:
                    break
            }
        }
        ccVoteRecord = {
            totalDistribution: total || 0,
            yes: yes || 0,
            no: no || 0,
            abstain: abstain || 0,
            notVoted: total || 0 - (yes || 0 + no || 0 + abstain || 0),
        }
    }
    if (spoVotes) {
        let total, yes, no, abstain

        for (const vote of spoVotes) {
            switch (vote.vote_type) {
                case 'total_distribution':
                    total = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'Yes':
                    yes = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'No':
                    no = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'Abstain':
                    abstain = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                default:
                    break
            }
        }

        // Ensure count for notVoted is correctly calculated
        const totalCount = total?.count || 0,
            totalPower = total?.power || 0
        const yesCount = yes?.count || 0,
            yesPower = yes?.power || 0
        const noCount = no?.count || 0,
            noPower = no?.power || 0
        const abstainCount = abstain?.count || 0,
            abstainPower = abstain?.power || 0

        // Calculate notVoted counts
        const notVotedCount = totalCount - yesCount - noCount - abstainCount

        // Calculate power for notVoted (using BigInt for calculation)
        const notVotedPower = (
            BigInt(totalPower) -
            BigInt(yesPower) -
            BigInt(noPower) -
            BigInt(abstainPower)
        ).toString()

        spoVoteRecord = {
            totalDistribution: total || emptyPowerAndCount,
            yes: yes || emptyPowerAndCount,
            no: no || emptyPowerAndCount,
            abstain: abstain || emptyPowerAndCount,
            notVoted: {
                count: notVotedCount,
                power: notVotedPower,
            },
        }
    }
    if (drepVotes) {
        let total, yes, no, abstain, inactive, alwaysAbstain, alwaysNoConfidence
        for (const vote of drepVotes) {
            switch (vote.vote_type) {
                case 'total_distribution':
                    total = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'Yes':
                    yes = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'No':
                    no = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'Abstain':
                    abstain = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'inactive_votes':
                    inactive = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'drep_always_abstain':
                    alwaysAbstain = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                case 'drep_always_no_confidence':
                    alwaysNoConfidence = {
                        count: vote.count,
                        power: vote.power ? vote.power.toString() : null,
                    }
                    break
                default:
                    break
            }
        }
        const totalCount = total?.count || 0,
            totalPower = total?.power || 0
        const yesCount = yes?.count || 0,
            yesPower = yes?.power || 0
        const noCount = no?.count || 0,
            noPower = no?.power || 0
        const abstainCount = abstain?.count || 0,
            abstainPower = abstain?.power || 0
        const alwaysAbstainCount = alwaysAbstain?.count || 0,
            alwaysAbstainPower = alwaysAbstain?.power || 0
        const alwaysNoConfidenceCount = alwaysNoConfidence?.count || 0,
            alwaysNoConfidencePower = alwaysNoConfidence?.power || 0

        const notVotedCount =
            totalCount - (yesCount + noCount + abstainCount + alwaysAbstainCount + alwaysNoConfidenceCount)
        const notVotedPower = (
            BigInt(totalPower) -
            BigInt(yesPower) -
            BigInt(noPower) -
            BigInt(abstainPower) -
            BigInt(alwaysAbstainPower) -
            BigInt(alwaysNoConfidencePower)
        ).toString()

        drepVoteRecord = {
            totalDistribution: total || emptyPowerAndCount,
            yes: yes || emptyPowerAndCount,
            no: no || emptyPowerAndCount,
            abstain: abstain || emptyPowerAndCount,
            inactive: inactive || emptyPowerAndCount,
            notVoted: {
                count: notVotedCount,
                power: notVotedPower,
            },
            delegators: {
                abstain: { power: alwaysAbstain?.power || 0 },
                noConfidence: { power: alwaysNoConfidence?.power || 0 },
            },
        }
    }
    const result = {
        drep: drepVoteRecord,
        spo: spoVoteRecord,
        cc: ccVoteRecord,
    }
    if (voter == 'drep') return drepVoteRecord
    else if (voter == 'spo') return spoVoteRecord
    else if (voter == 'cc') return ccVoteRecord
    else return result
}

// /api/proposals/${id}/votes
export const fetchProposalVotes = async (
    proposalId: string,
    proposalIndex: number,
    includeVotingPower?: boolean | false
) => {
    const results = (await prisma.$queryRaw`
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
                        ${
                            includeVotingPower
                                ? Prisma.sql`, 'votingPower', (
                                    SELECT dr.amount 
                                    FROM drep_distr dr 
                                    WHERE dr.hash_id = vp.drep_voter 
                                    AND epoch_no = (
                                        SELECT LEAST(latest_no, govAction.expiration) 
                                        FROM latestEpoch
                                    )
                                )`
                                : Prisma.sql``
                        }
                    )
                WHEN vp.pool_voter IS NOT NULL THEN 
                    jsonb_build_object(
                        'credential', ENCODE(ph.hash_raw, 'hex')
                        ${
                            includeVotingPower
                                ? Prisma.sql`, 'votingPower', (
                                    SELECT ps.voting_power 
                                    FROM pool_stat ps 
                                    WHERE ps.pool_hash_id = vp.pool_voter
                                    AND ps.epoch_no = (
                                        SELECT LEAST(latest_no, govAction.expiration)
                                        FROM latestEpoch
                                    )
                                )`
                                : Prisma.sql``
                        }
                        
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

// /api/proposals/${id}?include-vote-count=false/true (default false)
export const fetchProposalById = async (proposalId: string, proposaIndex: number, includeVoteCount?: boolean) => {
    const result = (await prisma.$queryRaw`
    WITH LatestDrepDistr AS (
        SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY hash_id ORDER BY epoch_no DESC) AS rn
        FROM
            drep_distr
    ),
    CommitteeData AS (
        SELECT DISTINCT ON (ch.raw)
            encode(ch.raw, 'hex') AS hash,
            cm.expiration_epoch,
            ch.has_script
        FROM
            committee_member cm
        JOIN committee_hash ch ON cm.committee_hash_id = ch.id
        ORDER BY
            ch.raw, cm.expiration_epoch DESC
    ),
    ParsedDescription AS (
        SELECT
            gov_action_proposal.id,
            description->'tag' AS tag,
            description->'contents'->1 AS members_to_be_removed,
            description->'contents'->2 AS members,
            description->'contents'->3 AS threshold
        FROM
            gov_action_proposal
        WHERE
            gov_action_proposal.type = 'NewCommittee'
    ),
    MembersToBeRemoved AS (
    SELECT
        id,
        json_agg(VALUE->>'keyHash') AS members_to_be_removed
    FROM
        ParsedDescription pd,
        json_array_elements(members_to_be_removed::json) AS value
    GROUP BY
        id
    ),
    ProcessedCurrentMembers AS (
        SELECT
            pd.id,
            json_agg(
                json_build_object(
                    'hash', regexp_replace(kv.key, '^keyHash-', ''),
                    'newExpirationEpoch', kv.value::int
                )
            ) AS current_members
        FROM
            ParsedDescription pd,
            jsonb_each_text(pd.members) AS kv(key, value)
        GROUP BY
            pd.id
    ),
    EnrichedCurrentMembers AS (
        SELECT
            pcm.id,
            json_agg(
                json_build_object(
                    'hash', cm.hash,
                    'expirationEpoch', cm.expiration_epoch,
                    'hasScript', cm.has_script,
                    'newExpirationEpoch', (member->>'newExpirationEpoch')::int
                )
            ) AS enriched_members
        FROM
            ProcessedCurrentMembers pcm
        LEFT JOIN json_array_elements(pcm.current_members) AS member ON true
        LEFT JOIN CommitteeData cm 
            ON (CASE 
                WHEN (member->>'hash') ~ '^[0-9a-fA-F]+$' 
                THEN encode(decode(member->>'hash', 'hex'), 'hex') 
                ELSE NULL 
            END) = cm.hash
        GROUP BY
            pcm.id
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
                            json_build_object('data', gov_action_proposal.description)
                        when gov_action_proposal.type::text = 'HardForkInitiation' then
                            json_build_object(
                                    'major', (gov_action_proposal.description->'contents'->1->>'major')::int,
                                    'minor', (gov_action_proposal.description->'contents'->1->>'minor')::int
                            )
                        WHEN gov_action_proposal.type::text = 'NoConfidence' THEN
                            json_build_object('data', gov_action_proposal.description->'contents')
                        WHEN gov_action_proposal.type::text = 'ParameterChange' THEN
                            json_build_object('data', gov_action_proposal.description->'contents')
                        WHEN gov_action_proposal.type::text = 'NewConstitution' THEN
                            json_build_object(
                                'anchor', gov_action_proposal.description->'contents'->1->'anchor',
                                'script', gov_action_proposal.description->'contents'->1->'script'
                            )
                        WHEN gov_action_proposal.type::text = 'NewCommittee' THEN
                            (
                                SELECT
                                    json_build_object(
                                        'tag', pd.tag,
                                        'members', em.enriched_members,
                                        'membersToBeRemoved', mtr.members_to_be_removed,
                                        'threshold', 
                                            CASE 
                                                WHEN (pd.threshold->>'numerator') IS NOT NULL 
                                                AND (pd.threshold->>'denominator') IS NOT NULL 
                                                THEN (pd.threshold->>'numerator')::float / (pd.threshold->>'denominator')::float
                                                ELSE NULL 
                                            END
                                    )
                                FROM
                                    ParsedDescription pd
                                JOIN
                                    MembersToBeRemoved mtr ON pd.id = mtr.id
                                JOIN
                                    EnrichedCurrentMembers em ON pd.id = em.id
                                WHERE
                                    pd.id = gov_action_proposal.id
                            )
                        ELSE
                            null
                    END,
        'status', CASE 
                    when gov_action_proposal.enacted_epoch is not NULL then json_build_object('enactedEpoch', gov_action_proposal.enacted_epoch)
                    when gov_action_proposal.ratified_epoch is not NULL then json_build_object('ratifiedEpoch', gov_action_proposal.ratified_epoch)
                    when gov_action_proposal.expired_epoch is not NULL then json_build_object('expiredEpoch', gov_action_proposal.expired_epoch)
                    else NULL
                 END,
        'expiryDate', epoch_utils.last_epoch_end_time + epoch_utils.epoch_duration * (gov_action_proposal.expiration - epoch_utils.last_epoch_no),
        'expiryEpochNon', gov_action_proposal.expiration,
        'createdDate', creator_block.time,
        'createdBlockHash', encode(creator_block.hash, 'hex'),
        'createdBlockNo', creator_block.block_no,
        'createdEpochNo', creator_block.epoch_no,
        'createdSlotNo', creator_block.slot_no,
        'url', voting_anchor.url,
        'metadataHash', encode(voting_anchor.data_hash, 'hex'),
        'protocolParams', jsonb_set(
            ROW_TO_JSON(proposal_params)::jsonb,
                            '{cost_model}', 
                            CASE
                                WHEN cost_model.id IS NOT NULL THEN
                                    ROW_TO_JSON(cost_model)::jsonb
                                ELSE
                                    'null'::jsonb
                            END
                        ),
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
            LEFT JOIN cost_model AS cost_model ON proposal_params.cost_model_id = cost_model.id
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
        creator_block.hash,
        creator_block.block_no,
        creator_block.slot_no,
        epoch_utils.epoch_duration,
        epoch_utils.last_epoch_no,
        epoch_utils.last_epoch_end_time,
        proposal_params,
        cost_model.id,
        voting_anchor.url,
        voting_anchor.data_hash,
        always_no_confidence_voting_power.amount,
        always_abstain_voting_power.amount,
        prev_gov_action.index,
        prev_gov_action_tx.hash) 
        HAVING creator_tx.hash = decode(${proposalId},'hex') AND gov_action_proposal.index = ${proposaIndex}`) as Record<
        any,
        any
    >[]
    const proposalVoteCount = includeVoteCount
        ? { vote: await fetchProposalVoteCount(proposalId, proposaIndex) }
        : undefined
    const resultData = result[0].result
    const parsedResult = {
        proposal: {
            type: resultData.type,
            details: resultData.details,
            metadataUrl: resultData.url,
            metadataHash: resultData.metadataHash,
        },
        meta: {
            protocolParams: resultData.protocolParams,
            title: resultData.title,
            abstract: resultData.abstract,
            motivation: resultData.motivation,
            rationale: resultData.rationale,
        },
        createdAt: {
            time: resultData.createdDate,
            block: parseInt(resultData.createdBlockNo),
            blockHash: resultData.createdBlockHash,
            epoch: parseInt(resultData.createdEpochNo),
            slot: parseInt(resultData.createdSlotNo),
            tx: resultData.txHash,
            index: parseInt(resultData.index),
        },
        status: resultData.status,
        expireAt: {
            time: resultData.expiryDate,
            epoch: parseInt(resultData.expiryEpochNon),
        },
        ...proposalVoteCount,
    }
    return parsedResult
}

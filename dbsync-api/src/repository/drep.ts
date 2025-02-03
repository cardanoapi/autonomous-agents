import {prisma} from '../config/db'
import {Prisma} from '@prisma/client'
import {combineArraysWithSameObjectKey, formatResult} from '../helpers/formatter'
import {DrepSortType, DrepStatusType} from '../types/drep'
import {fromHex, isHexValue} from '../helpers/validator'

export const fetchDrepList = async (page = 1, size = 10, drepId?: string, isScript?: boolean, status?: DrepStatusType, sort?: DrepSortType) => {
    let scriptPart = [true, false]
    if (isScript === true) {
        scriptPart = [true, true]
    } else if (isScript === false) {
        scriptPart = [false, false]
    }
    const result = (await prisma.$queryRaw`
        WITH DRepDistr AS (SELECT *,
                                  ROW_NUMBER() OVER (PARTITION BY drep_hash.id ORDER BY drep_distr.epoch_no DESC) AS rn
                           FROM drep_distr
                                    JOIN drep_hash ON drep_hash.id = drep_distr.hash_id),
             DRepActivity AS (SELECT drep_activity AS drep_activity,
                                     epoch_no      AS epoch_no
                              FROM epoch_param
                              WHERE epoch_no IS NOT NULL
                              ORDER BY epoch_no DESC
            LIMIT 1)
        SELECT json_build_object(
                       'drepId', encode(dh.raw, 'hex'),
                       'credential', encode(dh.raw, 'hex'),
                       'view', dh.view,
                       'url', va.url,
                       'hasScript', dh.has_script,
                       'metadataHash', encode(va.data_hash, 'hex'),
                       'deposit', dr_deposit.deposit,
                       'votingPower', DRepDistr.amount,
                       'status', CASE
                                     WHEN dr_deposit.deposit > 0 AND (DRepActivity.epoch_no -
                                                                      Max(coalesce(block.epoch_no, block_first_register.epoch_no))) <=
                                                                     DRepActivity.drep_activity THEN 'Active'
                                     WHEN dr_deposit.deposit > 0 AND (DRepActivity.epoch_no -
                                                                      Max(coalesce(block.epoch_no, block_first_register.epoch_no))) >
                                                                     DRepActivity.drep_activity THEN 'Inactive'
                                     WHEN dr_deposit.deposit < 0 THEN 'Retired'
                           END,
                       'latestTxHash', encode(dr_voting_anchor.tx_hash, 'hex'),
                       'latestRegistrationDate', newestRegister.time,
                       'paymentAddress', off_chain_vote_drep_data.payment_address,
                       'givenName', off_chain_vote_drep_data.given_name,
                       'objectives', off_chain_vote_drep_data.objectives,
                       'motivations', off_chain_vote_drep_data.motivations,
                       'qualifications', off_chain_vote_drep_data.qualifications,
                       'imageUrl', off_chain_vote_drep_data.image_url,
                       'imageHash', off_chain_vote_drep_data.image_hash
               ) AS     result,
               COUNT(*) OVER () AS total_count
        FROM drep_hash dh
                 JOIN (SELECT dr.id,
                              dr.drep_hash_id,
                              dr.deposit,
                              ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn
                       FROM drep_registration dr
                       WHERE dr.deposit IS NOT NULL) AS dr_deposit ON dr_deposit.drep_hash_id = dh.id
            AND dr_deposit.rn = 1
                 JOIN (SELECT dr.id,
                              dr.drep_hash_id,
                              dr.deposit,
                              ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn
                       FROM drep_registration dr) AS latestDeposit ON latestDeposit.drep_hash_id = dh.id
            AND latestDeposit.rn = 1
                 LEFT JOIN (SELECT dr.id,
                                   dr.drep_hash_id,
                                   dr.voting_anchor_id,
                                   ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn, tx.hash AS tx_hash
                            FROM drep_registration dr
                                     JOIN tx ON tx.id = dr.tx_id
                            WHERE dr.deposit > 0
                               OR dr.deposit is Null) AS dr_voting_anchor ON dr_voting_anchor.drep_hash_id = dh.id
            AND dr_voting_anchor.rn = 1
                 LEFT JOIN (SELECT dr.id,
                                   dr.drep_hash_id,
                                   dr.voting_anchor_id,
                                   ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn, tx.hash AS tx_hash
                            FROM drep_registration dr
                                     JOIN tx ON tx.id = dr.tx_id
                            WHERE dr.deposit is not null
                              AND dr.deposit >= 0) AS dr_non_deregister_voting_anchor
                           ON dr_non_deregister_voting_anchor.drep_hash_id = dh.id
                               AND dr_non_deregister_voting_anchor.rn = 1
                 LEFT JOIN (SELECT dr.id,
                                   dr.drep_hash_id,
                                   dr.voting_anchor_id,
                                   ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn
                            FROM drep_registration dr) AS second_to_newest_drep_registration
                           ON second_to_newest_drep_registration.drep_hash_id = dh.id
                               AND second_to_newest_drep_registration.rn = 2
                 LEFT JOIN DRepDistr ON DRepDistr.hash_id = dh.id
            AND DRepDistr.rn = 1
                 LEFT JOIN voting_anchor va ON va.id = dr_voting_anchor.voting_anchor_id
                 LEFT JOIN voting_anchor non_deregister_voting_anchor
                           on non_deregister_voting_anchor.id = dr_non_deregister_voting_anchor.voting_anchor_id
                 LEFT JOIN off_chain_vote_fetch_error ON off_chain_vote_fetch_error.voting_anchor_id = va.id
                 LEFT JOIN off_chain_vote_data ON off_chain_vote_data.voting_anchor_id = va.id
                 LEFT JOIN off_chain_vote_drep_data
                           on off_chain_vote_drep_data.off_chain_vote_data_id = off_chain_vote_data.id
                 CROSS JOIN DRepActivity
                 LEFT JOIN voting_procedure AS voting_procedure ON voting_procedure.drep_voter = dh.id
                 LEFT JOIN tx AS tx ON tx.id = voting_procedure.tx_id
                 LEFT JOIN block AS block ON block.id = tx.block_id
                 LEFT JOIN (SELECT block.time,
                                   dr.drep_hash_id,
                                   ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn
                            FROM drep_registration dr
                                     JOIN tx ON tx.id = dr.tx_id
                                     JOIN block ON block.id = tx.block_id
                            WHERE NOT (dr.deposit < 0)) AS newestRegister ON newestRegister.drep_hash_id = dh.id
            AND newestRegister.rn = 1
                 LEFT JOIN (SELECT dr.tx_id,
                                   dr.drep_hash_id,
                                   ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id ASC) AS rn
                            FROM drep_registration dr) AS dr_first_register
                           ON dr_first_register.drep_hash_id = dh.id
                               AND dr_first_register.rn = 1
                 LEFT JOIN tx AS tx_first_register ON tx_first_register.id = dr_first_register.tx_id
                 LEFT JOIN block AS block_first_register ON block_first_register.id = tx_first_register.block_id
            ${
                    drepId
                            ? isHexValue(drepId)
                                    ? Prisma.sql`WHERE dh.raw = decode(${drepId}, 'hex') and (dh.has_script = ${scriptPart[0]} OR dh.has_script = ${scriptPart[1]})`
                                    : Prisma.sql`WHERE off_chain_vote_drep_data.given_name ILIKE ${drepId + '%'}`
                            : Prisma.sql``
            }
        GROUP BY dh.raw,
            second_to_newest_drep_registration.voting_anchor_id,
            dh.view,
            dh.has_script,
            va.url,
            va.data_hash,
            dr_deposit.deposit,
            DRepDistr.amount,
            DRepActivity.epoch_no,
            DRepActivity.drep_activity,
            dr_voting_anchor.tx_hash,
            newestRegister.time,
            latestDeposit.deposit,
            non_deregister_voting_anchor.url,
            off_chain_vote_fetch_error.fetch_error,
            off_chain_vote_drep_data.payment_address,
            off_chain_vote_drep_data.given_name,
            off_chain_vote_drep_data.objectives,
            off_chain_vote_drep_data.motivations,
            off_chain_vote_drep_data.qualifications,
            off_chain_vote_drep_data.image_url,
            off_chain_vote_drep_data.image_hash ${
                                                        status
                                                                ? status === 'Active'
                                                                        ? Prisma.sql`HAVING dr_deposit.deposit > 0 AND (DRepActivity.epoch_no - Max(coalesce(block.epoch_no, block_first_register.epoch_no))) <= DRepActivity.drep_activity`
                                                                        : status === 'Inactive'
                                                                                ? Prisma.sql`HAVING dr_deposit.deposit > 0 AND (DRepActivity.epoch_no - Max(coalesce(block.epoch_no, block_first_register.epoch_no))) > DRepActivity.drep_activity`
                                                                                : Prisma.sql`HAVING dr_deposit.deposit < 0`
                                                                : Prisma.sql``
                                                }
                                                ${
                                                        sort === 'VotingPower'
                                                                ? Prisma.sql`ORDER BY DRepDistr.amount DESC NULLS LAST`
                                                                : Prisma.sql`ORDER BY newestRegister.time DESC`
                                                }
        OFFSET ${(page ? page - 1 : 0) * (size ? size : 10)} FETCH NEXT ${size ? size : 10} ROWS ONLY
    `) as Record<any, any>[]
    const totalCount = result.length ? Number(result[0].total_count) : 0
    return {items: formatResult(result), totalCount}
}

export const fetchDrepDetails = async (drepId: string, isScript?: boolean) => {
    let scriptPart = [true, false]
    if (isScript === true) {
        scriptPart = [true, true]
    } else if (isScript === false) {
        scriptPart = [false, false]
    }

    const result = (await prisma.$queryRaw`
        WITH dreps AS (SELECT id, has_script
                       FROM drep_hash
                       WHERE drep_hash.raw = decode(${drepId}, 'hex')
                         AND (drep_hash.has_script = ${scriptPart[0]} OR drep_hash.has_script = ${scriptPart[1]})),
             drep as (SELECT dreps.*
                      from drep_registration
                               join dreps on dreps.id = drep_registration.drep_hash_id
                      where deposit > 0
                      order by tx_id desc limit 1), AllRegistrationEntries AS (
        SELECT drep_registration.voting_anchor_id AS voting_anchor_id, drep_registration.deposit AS deposit, tx.hash AS tx_hash, tx.id as tx_id
        FROM drep_registration
            JOIN drep
        ON drep.id = drep_registration.drep_hash_id
            JOIN tx ON tx.id = drep_registration.tx_id
        ORDER BY drep_registration.tx_id asc),
            LatestRegistrationEntry AS (
        SELECT drep_registration.voting_anchor_id AS voting_anchor_id, drep_registration.deposit AS deposit, tx.hash AS tx_hash
        FROM drep_registration
            JOIN drep
        ON drep.id = drep_registration.drep_hash_id
            JOIN tx ON tx.id = drep_registration.tx_id
        ORDER BY drep_registration.tx_id DESC
            LIMIT 1),
            IsRegisteredAsDRep AS (
        SELECT (LatestRegistrationEntry.deposit IS NULL
            OR LatestRegistrationEntry.deposit > 0)
            AND LatestRegistrationEntry.voting_anchor_id IS NOT NULL AS value
        FROM LatestRegistrationEntry), IsRegisteredAsSoleVoter AS (
        SELECT (LatestRegistrationEntry.deposit IS NULL
            OR LatestRegistrationEntry.deposit > 0)
            AND LatestRegistrationEntry.voting_anchor_id IS NULL AS value
        FROM LatestRegistrationEntry), CurrentDeposit AS (
        SELECT GREATEST(drep_registration.deposit, 0) AS value
        FROM drep_registration
            JOIN drep
        ON drep.id = drep_registration.drep_hash_id
        WHERE drep_registration.deposit IS NOT NULL
        ORDER BY drep_registration.tx_id DESC
            LIMIT 1),
            WasRegisteredAsDRep AS (
        SELECT (EXISTS (SELECT *
            FROM drep_registration
            JOIN drep ON drep.id = drep_registration.drep_hash_id
            WHERE
            drep_registration.voting_anchor_id IS NOT NULL)) AS value), WasRegisteredAsSoleVoter AS (
        SELECT (EXISTS (SELECT *
            FROM drep_registration
            JOIN drep ON drep.id = drep_registration.drep_hash_id
            WHERE
            drep_registration.voting_anchor_id IS NULL)) AS value), CurrentMetadata AS (
        SELECT voting_anchor.url AS url, encode(voting_anchor.data_hash, 'hex') AS data_hash
        FROM LatestRegistrationEntry
            LEFT JOIN voting_anchor
        ON voting_anchor.id = LatestRegistrationEntry.voting_anchor_id
            LIMIT 1),
            CurrentVotingPower AS (
        SELECT amount AS amount
        FROM drep
            LEFT JOIN drep_distr
        ON drep_distr.hash_id = drep.id
        ORDER BY drep_distr.epoch_no DESC
            LIMIT 1),
            DRepRegister AS (
        SELECT encode(AllRegistrationEntries.tx_hash, 'hex') as tx_hash, AllRegistrationEntries.tx_id
        FROM (SELECT 1) AS dummy
            LEFT JOIN
            AllRegistrationEntries
        ON AllRegistrationEntries.voting_anchor_id IS NOT NULL and
            not (coalesce (deposit, 0) < 0)
        ORDER BY AllRegistrationEntries.tx_id DESC
            LIMIT 1),
            DRepRetire AS (
        SELECT encode(AllRegistrationEntries.tx_hash, 'hex') as tx_hash, AllRegistrationEntries.tx_id as tx_id
        FROM DRepRegister
            LEFT JOIN
            AllRegistrationEntries
        ON (AllRegistrationEntries.deposit < 0
            OR AllRegistrationEntries.voting_anchor_id IS NULL)
            and AllRegistrationEntries.tx_id > DRepRegister.tx_id
        ORDER BY AllRegistrationEntries.tx_id asc
            LIMIT 1),
            SoleVoterRegister AS (
        SELECT encode(AllRegistrationEntries.tx_hash, 'hex') as tx_hash, AllRegistrationEntries.tx_id
        FROM (SELECT 1) AS dummy
            LEFT JOIN
            AllRegistrationEntries
        ON AllRegistrationEntries.voting_anchor_id IS NULL and
            not (coalesce (deposit, 0) < 0)
        ORDER BY AllRegistrationEntries.tx_id DESC
            LIMIT 1),
            SoleVoterRetire AS (
        SELECT encode(AllRegistrationEntries.tx_hash, 'hex') as tx_hash
        FROM SoleVoterRegister
            LEFT JOIN
            AllRegistrationEntries
        ON (AllRegistrationEntries.deposit < 0
            OR AllRegistrationEntries.voting_anchor_id IS NOT NULL)
            AND AllRegistrationEntries.tx_id > SoleVoterRegister.tx_id
        ORDER BY AllRegistrationEntries.tx_id asc
            LIMIT 1),
            IsScriptHash AS (
        SELECT EXISTS (SELECT drep.has_script
            FROM drep
            WHERE drep.has_script = true) AS has_script), DrepDetails AS (
        SELECT IsScriptHash.has_script as "hasScript", IsRegisteredAsDRep.value as "isRegisteredAsDRep", WasRegisteredAsDRep.value as "wasRegisteredAsDRep", IsRegisteredAsSoleVoter.value as "isRegisteredAsSoleVoter", WasRegisteredAsSoleVoter.value as "wasRegisteredAsSoleVoter", CurrentDeposit.value as "deposit", CurrentMetadata.url as "url", CurrentMetadata.data_hash as "dataHash", CurrentVotingPower.amount as "votingPower", DRepRegister.tx_hash as "dRepRegisterTxHash", DRepRetire.tx_hash as "dRepRetireTxHash", SoleVoterRegister.tx_hash as "soleVoterRegisterTxHash", SoleVoterRetire.tx_hash as "soleVoterRetireTxHash"
        FROM IsRegisteredAsDRep
            CROSS JOIN IsRegisteredAsSoleVoter
            CROSS JOIN WasRegisteredAsDRep
            CROSS JOIN WasRegisteredAsSoleVoter
            CROSS JOIN CurrentDeposit
            CROSS JOIN CurrentMetadata
            CROSS JOIN CurrentVotingPower
            CROSS JOIN DRepRegister
            CROSS JOIN DRepRetire
            CROSS JOIN SoleVoterRegister
            CROSS JOIN SoleVoterRetire
            CROSS JOIN IsScriptHash)

        SELECT json_build_object(
                       'drep_details', (SELECT row_to_json(DrepDetails) FROM DrepDetails)
               ) as result;
    `) as Record<string, any>[]
    return result[0].result.drep_details ? result[0].result.drep_details : result[0].result
}

export const fetchDrepVoteDetails = async (dRepId: string, isScript?: boolean) => {
    let scriptPart = [true, false]
    if (isScript === true) {
        scriptPart = [true, true]
    } else if (isScript === false) {
        scriptPart = [false, false]
    }

    const result = (await prisma.$queryRaw`
        WITH DrepVoteDetails
                 as (SELECT DISTINCT
        ON (gp.id, voting_procedure.drep_voter) concat(encode(gov_action_tx.hash, 'hex'), '#', gp.index) as govActionId,
            gov_action_metadata.title as title,
            voting_procedure.vote::text as voteType,
            voting_anchor.url as voteAnchorUrl,
            encode(voting_anchor.data_hash, 'hex') as voteAnchorHash,
            block.epoch_no as epochNo,
            block.time as time,
            encode(vote_tx.hash, 'hex') as voteTxHash,
            gp.type as govActionType
        FROM voting_procedure
            JOIN gov_action_proposal AS gp
        ON gp.id = voting_procedure.gov_action_proposal_id
            JOIN drep_hash
            ON drep_hash.id = voting_procedure.drep_voter
            LEFT JOIN voting_anchor
            ON voting_anchor.id = voting_procedure.voting_anchor_id
            JOIN tx AS gov_action_tx
            ON gov_action_tx.id = gp.tx_id
            JOIN tx AS vote_tx
            ON vote_tx.id = voting_procedure.tx_id
            JOIN block
            ON block.id = vote_tx.block_id
            LEFT JOIN off_chain_vote_data
            ON off_chain_vote_data.voting_anchor_id = gp.voting_anchor_id
            LEFT JOIN off_chain_vote_gov_action_data AS gov_action_metadata
            ON gov_action_metadata.off_chain_vote_data_id = off_chain_vote_data.id
        WHERE drep_hash.raw = decode(${dRepId}
            , 'hex')
          AND (drep_hash.has_script = ${scriptPart[0]}
           OR drep_hash.has_script= ${scriptPart[1]})
        ORDER BY gp.id, voting_procedure.drep_voter, block.time, voting_procedure.id DESC),
            TimeOrderedDrepVoteDetails as (
        select *
        from DrepVoteDetails
        order by DrepVoteDetails.time desc)
        SELECT json_agg(
                       json_build_object(
                               'govActionId', TimeOrderedDrepVoteDetails.govActionId,
                               'title', TimeOrderedDrepVoteDetails.title,
                               'voteType', TimeOrderedDrepVoteDetails.voteType,
                               'voteAnchorUrl', TimeOrderedDrepVoteDetails.voteAnchorUrl,
                               'voteAnchorHash', TimeOrderedDrepVoteDetails.voteAnchorHash,
                               'epochNo', TimeOrderedDrepVoteDetails.epochNo,
                               'time', TimeOrderedDrepVoteDetails.time,
                               'voteTxHash', TimeOrderedDrepVoteDetails.voteTxHash,
                               'govActionType', TimeOrderedDrepVoteDetails.govActionType
                       )
               ) AS votes
        from TimeOrderedDrepVoteDetails
    `) as Record<any, any>[]
    return result[0].votes
}

// drep delegation historty
export const fetchDrepDelegationDetails = async (dRepId: string) => {
    const delegateDetails = prisma.$queryRaw`
        with delegator as (select *, ROW_NUMBER() OVER (PARTITION BY addr_id order by tx_id desc) AS rn
                           from delegation_vote as dv
                                    join drep_hash as dh on dv.drep_hash_id = dh.id
                           where dh.raw = decode(${dRepId}, 'hex'))
        select json_build_object(
                       'stakeAddress', addr.view,
                       'utxoBalance', sum(uv.value),
                       'currentDrepDelegateTime', b.time,
                       'rewardBalance', (select sum(amount) as amount
                                         from reward r
                                         where r.addr_id = uv.stake_address_id
                                           and r.earned_epoch
                                             >
                                               (select blka.epoch_no as epoch_no
                                                from withdrawal w
                                                         join tx txa on txa.id = w.tx_id
                                                         join block blka on blka.id = txa.block_id
                                                where w.addr_id = uv.stake_address_id
                                                order by w.tx_id desc
                           limit 1)),
                     'rewardRestBalance', (select sum(amount) as amount
                                           from reward_rest r
                                           where r.addr_id = uv.stake_address_id
                                             and r.earned_epoch
                                               >
                                                 (select blka.epoch_no as epoch_no
                                                  from withdrawal w
                                                           join tx txa on txa.id = w.tx_id
                                                           join block blka on blka.id = txa.block_id
                                                  where w.addr_id = uv.stake_address_id
                                                  order by w.tx_id desc
                                                  limit 1)))
        from delegator
                 join utxo_view as uv on delegator.addr_id = uv.stake_address_id
                 join stake_address as addr on addr.id = uv.stake_address_id
                 join tx on tx.id = delegator.tx_id
                 join public.block b on tx.block_id = b.id
        where delegator.rn = 1
        group by uv.stake_address_id, addr.view, b.time
    `

    const prevDrep = prisma.$queryRaw`
        WITH SearchedDrep AS (SELECT id
                              FROM drep_hash
                              WHERE raw = decode(${dRepId}, 'hex')),
             DelegatedStakes as (select addr_id
                                 from delegation_vote
                                 where drep_hash_id = (Select id from SearchedDrep)
                                 group by addr_id),
             OrderedDrepWithEpochTime as (select d.addr_id, dv.drep_hash_id, max(dv.tx_id) as tx_id
                                          from delegation_vote as dv
                                                   join DelegatedStakes as d on dv.addr_id = d.addr_id
                                          group by d.addr_id, dv.drep_hash_id
                                          order by d.addr_id, max(dv.tx_id) desc),
             PrevDrep
                 as (select dh.view    as drepView,
                            tx.hash       tx_hash,

                            b.epoch_no as epoch_no,
                            b.time as time, dh.id as drep_id, addr.view as stake_address, od.given_name as drepName, od.image_url as drepImage, dh.has_script as hasScript, row_number() over (partition by p.addr_id order by p.tx_id desc) as rn
        from OrderedDrepWithEpochTime as p
            join tx
        on p.tx_id = tx.id
            join block b on b.id = tx.block_id
            join drep_hash as dh on dh.id = p.drep_hash_id
            join stake_address as addr on addr.id = p.addr_id
            join drep_registration as dr on dr.drep_hash_id = dh.id
            join off_chain_vote_data as ov on ov.voting_anchor_id = dr.voting_anchor_id
            join off_chain_vote_drep_data as od on od.off_chain_vote_data_id = ov.id)
        select json_build_object('drepView', drepView, 'prevDrepTxHash', encode(tx_hash, 'hex'),
                                 'prevDrepEpochNo', epoch_no, 'prevDrepDelegateTime', time,
                                 'stakeAddress', stake_address, 'prevDrepName', drepName, 'prevDrepImage', drepImage,
                                 'hasScript', hasScript
               )
        from PrevDrep as p
        where p.rn = 2
    `
    const result = await Promise.all([delegateDetails, prevDrep])
    return combineArraysWithSameObjectKey(...result).map((r: any) => r.json_build_object)
}

export const fetchDrepRegistrationDetails = async (dRepId: string, isScript?:boolean) => {
    let scriptPart = [true, false]
    if (isScript === true) {
        scriptPart = [true, true]
    } else if (isScript === false) {
        scriptPart = [false, false]
    }
    const result = (await prisma.$queryRaw`
        select json_build_object('url', va.url, 'deposit', dr.deposit, 'drepName', od.given_name, 'time', b.time)
        from drep_hash dh
                 join drep_registration dr on dh.id = dr.drep_hash_id
                 join tx on dr.tx_id = tx.id
                 join block b on tx.block_id = b.id
                 left join voting_anchor va on va.id = dr.voting_anchor_id
                 left join off_chain_vote_data ov on va.id = ov.voting_anchor_id
                 left join off_chain_vote_drep_data od on ov.id = od.off_chain_vote_data_id
        where dh.raw = decode(${dRepId}, 'hex') AND (dh.has_script = ${scriptPart[0]} OR dh.has_script = ${scriptPart[1]})
        order by b.time desc;
    `) as Record<string, any>[]
    return result.map((r) => r.json_build_object)
}

export const fetchDrepActiveDelegation = async (drepId: string, isScript?:boolean) => {
    let scriptPart = [true, false]
    if (isScript === true) {
        scriptPart = [true, true]
    } else if (isScript === false) {
        scriptPart = [false, false]
    }
    const result = (await prisma.$queryRaw`
        WITH liveRecord AS (WITH latest AS (WITH stakes AS (SELECT DISTINCT sa.id AS id, sa.view AS stakeAddress
                                                            FROM delegation_vote dv
                                                                     JOIN drep_hash dh ON dh.id = dv.drep_hash_id
                                                                     JOIN stake_address sa ON sa.id = dv.addr_id
                                                            WHERE dh.raw = DECODE(${drepId}, 'hex')
                                                              AND (dh.has_script = ${scriptPart[0]} OR dh.has_script = ${scriptPart[1]}))
                                            SELECT stakes.stakeAddress,
                                                   stakes.id
                                            FROM stakes
                                                     JOIN LATERAL (
                                                SELECT ENCODE(tx.hash, 'hex') AS tx_id,
                                                       b.epoch_no,
                                                       b.time,
                                                       dh.raw                 AS raw_check
                                                FROM delegation_vote dv
                                                         JOIN drep_hash dh ON dh.id = dv.drep_hash_id
                                                         JOIN tx ON tx.id = dv.tx_id
                                                         JOIN block b ON b.id = tx.block_id
                                                WHERE dv.addr_id = stakes.id
                                                ORDER BY dv.tx_id DESC
                                                    LIMIT 1
            ) AS subquery
        ON subquery.raw_check = DECODE(${drepId}, 'hex')
        GROUP BY stakes.stakeAddress, stakes.id
        ORDER BY stakes.id
            )
        SELECT COUNT(DISTINCT (latest.stakeAddress)) AS activeDelegators,
               COALESCE(SUM(uv.value), 0) +
               COALESCE((SELECT SUM(amount)
                         FROM reward r
                         WHERE r.addr_id = latest.id
                           AND r.earned_epoch >
                               (SELECT blka.epoch_no
                                FROM withdrawal w
                                         JOIN tx txa ON txa.id = w.tx_id
                                         JOIN block blka ON blka.id = txa.block_id
                                WHERE w.addr_id = latest.id
                                ORDER BY w.tx_id DESC
                        LIMIT 1)
            ), 0) +
               COALESCE((SELECT SUM(amount)
                         FROM reward_rest r
                         WHERE r.addr_id = latest.id
                           AND r.earned_epoch >
                               (SELECT blka.epoch_no
                                FROM withdrawal w
                                         JOIN tx txa ON txa.id = w.tx_id
                                         JOIN block blka ON blka.id = txa.block_id
                                WHERE w.addr_id = latest.id
                                ORDER BY w.tx_id DESC
                        LIMIT 1)
            ), 0)     AS liveVotingPower
        FROM latest
                 LEFT JOIN utxo_view uv ON uv.stake_address_id = latest.id
        GROUP BY latest.stakeAddress, latest.id)
        SELECT SUM(activedelegators) as activeDelegators, SUM(livevotingpower) as liveVotingPower
        FROM liveRecord
    `) as Record<string, any>[]

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
    const decimalInfluence = Number(result[0].livevotingpower) / Number(totalVotingPower)
    const influence = (decimalInfluence * 100).toFixed(4) + '%'
    const response = {
        liveDelegators: result[0].activedelegators ? parseInt(result[0].activedelegators) : 0,
        liveVotingPower: result[0].livevotingpower ? result[0].livevotingpower.toString() : '0',
        influence: influence,
    }
    return response
}

export const fetchDrepLiveDelegators = async (dRepId: string, isScript?:boolean) => {
    let scriptPart = [true, false]
    if (isScript === true) {
        scriptPart = [true, true]
    } else if (isScript === false) {
        scriptPart = [false, false]
    }
    const result = (await prisma.$queryRaw`
        WITH latest AS (WITH stakes AS (SELECT DISTINCT sa.id AS id, sa.view AS stakeAddress
                                        FROM delegation_vote dv
                                                 JOIN drep_hash dh ON dh.id = dv.drep_hash_id
                                                 JOIN stake_address sa ON sa.id = dv.addr_id
                                        WHERE dh.raw = DECODE(${dRepId}, 'hex')
                                          AND (dh.has_script = ${scriptPart[0]} OR dh.has_script = ${scriptPart[1]}))
                        SELECT stakes.stakeAddress,
                               stakes.id,
                               JSON_AGG(
                                       JSON_BUILD_OBJECT(
                                               'txId', subquery.tx_id,
                                               'epoch', subquery.epoch_no,
                                               'time', subquery.time
                                       )
                               ) AS delegations
                        FROM stakes
                                 JOIN LATERAL (
                            SELECT ENCODE(tx.hash, 'hex') AS tx_id,
                                   b.epoch_no,
                                   b.time,
                                   dh.raw                 AS raw_check
                            FROM delegation_vote dv
                                     JOIN drep_hash dh ON dh.id = dv.drep_hash_id
                                     JOIN tx ON tx.id = dv.tx_id
                                     JOIN block b ON b.id = tx.block_id
                            WHERE dv.addr_id = stakes.id
                            ORDER BY dv.tx_id DESC
                                LIMIT 1
            ) AS subquery
        ON subquery.raw_check = DECODE(${dRepId}, 'hex')
        GROUP BY stakes.stakeAddress, stakes.id
        ORDER BY stakes.id
            )
        SELECT latest.stakeAddress,
               latest.delegations::text, COALESCE(SUM(uv.value), 0) AS utxo,
               (SELECT SUM(amount)
                FROM reward r
                WHERE r.addr_id = latest.id
                  AND r.earned_epoch >
                      (SELECT blka.epoch_no
                       FROM withdrawal w
                                JOIN tx txa ON txa.id = w.tx_id
                                JOIN block blka ON blka.id = txa.block_id
                       WHERE w.addr_id = latest.id
                       ORDER BY w.tx_id DESC
                   LIMIT 1)) AS rewardBalance,
            (
        SELECT SUM (amount)
        FROM reward_rest r
        WHERE r.addr_id = latest.id
          AND r.earned_epoch
            >
            (SELECT blka.epoch_no
            FROM withdrawal w
            JOIN tx txa ON txa.id = w.tx_id
            JOIN block blka ON blka.id = txa.block_id
            WHERE w.addr_id = latest.id
            ORDER BY w.tx_id DESC
            LIMIT 1)) AS rewardRestBalance
        FROM latest
            LEFT JOIN utxo_view uv
        ON uv.stake_address_id = latest.id
        GROUP BY latest.stakeAddress, latest.id, latest.delegations::text;
    `) as Record<string, any>[]
    const parsedResult = () => {
        return result.map((item) => ({
            stakeAddress: item.stakeaddress,
            delegatedAt: JSON.parse(item.delegations)[0],
        }))
    }
    return parsedResult()
}

export const fetchDrepDelegationHistory = async (dRepId: string, isScript?:boolean) => {
    let scriptPart = [true, false]
    if (isScript === true) {
        scriptPart = [true, true]
    } else if (isScript === false) {
        scriptPart = [false, false]
    }
    const result = (await prisma.$queryRaw`
        WITH stakes AS (SELECT DISTINCT sa.id AS id, sa.view AS stake
                        FROM delegation_vote dv
                                 JOIN drep_hash dh ON dh.id = dv.drep_hash_id
                                 JOIN stake_address sa ON sa.id = dv.addr_id
                        WHERE dh.raw = DECODE(${dRepId}, 'hex') AND (dh.has_script = ${scriptPart[0]} OR dh.has_script = ${scriptPart[1]}))
        SELECT stakes.stake,
               JSON_AGG(
                       JSON_BUILD_OBJECT(
                               'drep', dh.view,
                               'tx_id', ENCODE(tx.hash, 'hex'),
                               'epoch_no', b.epoch_no,
                               'time', b.time
                       ) ORDER BY dv.tx_id DESC
               ) AS delegations
        FROM delegation_vote dv
                 JOIN stakes ON dv.addr_id = stakes.id
                 JOIN drep_hash dh ON dh.id = dv.drep_hash_id
                 JOIN tx ON tx.id = dv.tx_id
                 JOIN block b ON b.id = tx.block_id
        GROUP BY stakes.stake
        ORDER BY stakes.stake;
    `) as Record<string, any>[]
    interface Delegation {
        stakeAddress: string
        action: 'joined' | 'left'
        txId: string
        epochNo: number
        time: string
    }
    const processDelegations = (data: any[], bech32Drep: string) => {
        type DelegationInfo = { tx_id: string; epoch_no: number; time: string }
        type DelegationHistory = { joined?: DelegationInfo; left?: DelegationInfo }
        type Result = {
            stakeAddress: string
            delegation: DelegationHistory[]
        }

        const result = []

        for (const stakeData of data) {
            const stakeAddress = stakeData.stake
            const delegations = stakeData.delegations

            let partialResult: Result = {
                stakeAddress: stakeAddress,
                delegation: [],
            }

            let joinedFound = false
            let delegationHistory: DelegationHistory = {joined: undefined, left: undefined}
            let stakeDelegationHistory: DelegationHistory[] = []

            for (let i = delegations.length - 1; i >= 0; i--) {
                const delegation = delegations[i]
                const {drep, tx_id, epoch_no, time} = delegation

                if (drep === bech32Drep) {
                    delegationHistory.joined = {tx_id, epoch_no, time}
                    joinedFound = true
                } else if (joinedFound) {
                    delegationHistory.left = {tx_id, epoch_no, time}
                    stakeDelegationHistory.push(delegationHistory)
                    delegationHistory = {joined: undefined, left: undefined}
                    joinedFound = false
                }
            }
            if (delegationHistory.joined || delegationHistory.left) {
                stakeDelegationHistory.push(delegationHistory)
            }
            partialResult.delegation = stakeDelegationHistory
            result.push(partialResult)
        }

        return result
    }
    const drepbech32 = fromHex('drep', dRepId)
    const processedDelegations = processDelegations(result, drepbech32)
    const flattenedDelegations: Delegation[] = []
    processedDelegations.forEach((del) => {
        let stakeAddress = del.stakeAddress
        del.delegation.forEach((delegationAction) => {
            if (delegationAction.joined) {
                const delegationObject: Delegation = {
                    stakeAddress: stakeAddress,
                    action: 'joined',
                    txId: delegationAction.joined.tx_id,
                    epochNo: delegationAction.joined.epoch_no,
                    time: delegationAction.joined.time,
                }
                flattenedDelegations.push(delegationObject)
            }
            if (delegationAction.left) {
                const delegationObject: Delegation = {
                    stakeAddress: stakeAddress,
                    action: 'left',
                    txId: delegationAction.left.tx_id,
                    epochNo: delegationAction.left.epoch_no,
                    time: delegationAction.left.time,
                }
                flattenedDelegations.push(delegationObject)
            }
        })
    })
    flattenedDelegations.sort((a: Delegation, b: Delegation) => new Date(b.time).getTime() - new Date(a.time).getTime())
    return flattenedDelegations
}

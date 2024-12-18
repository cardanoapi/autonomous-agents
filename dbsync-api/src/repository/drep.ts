import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";
import { formatResult } from "../helpers/formatter";
import { DrepSortType, DrepStatusType } from "../types/drep";

export const fetchDrepList = async (page=1,size=10,drepId='', status?:DrepStatusType,sort?:DrepSortType)=>{
  const result  = await prisma.$queryRaw
    `
    WITH DRepDistr AS (
      SELECT
          *,
          ROW_NUMBER() OVER (PARTITION BY drep_hash.id ORDER BY drep_distr.epoch_no DESC) AS rn
      FROM
          drep_distr
              JOIN drep_hash ON drep_hash.id = drep_distr.hash_id
  ),
       DRepActivity AS (
           SELECT
               drep_activity AS drep_activity,
               epoch_no AS epoch_no
           FROM
               epoch_param
           WHERE
               epoch_no IS NOT NULL
           ORDER BY
               epoch_no DESC
           LIMIT 1
       )
    SELECT
        json_build_object(
                'drepId', encode(dh.raw, 'hex'),
                'view', dh.view,
                'url', va.url,
                'metadataHash', encode(va.data_hash, 'hex'),
                'deposit', dr_deposit.deposit,
                'votingPower', DRepDistr.amount,
                'status', CASE
                              WHEN dr_deposit.deposit > 0 AND (DRepActivity.epoch_no - Max(coalesce(block.epoch_no, block_first_register.epoch_no))) <= DRepActivity.drep_activity THEN 'Active'
                              WHEN dr_deposit.deposit > 0 AND (DRepActivity.epoch_no - Max(coalesce(block.epoch_no, block_first_register.epoch_no))) > DRepActivity.drep_activity THEN 'Inactive'
                              WHEN dr_deposit.deposit < 0 THEN 'Retired'
                    END,
                'latestTxHash', encode(dr_voting_anchor.tx_hash, 'hex'),
                'latestRegistrationDate', newestRegister.time
        ) AS result,
        COUNT(*) OVER () AS total_count
  FROM
      drep_hash dh
          JOIN (
          SELECT
              dr.id,
              dr.drep_hash_id,
              dr.deposit,
              ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn
          FROM
              drep_registration dr
          WHERE
              dr.deposit IS NOT NULL) AS dr_deposit ON dr_deposit.drep_hash_id = dh.id
          AND dr_deposit.rn = 1
          JOIN (
          SELECT
              dr.id,
              dr.drep_hash_id,
              dr.deposit,
              ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn
          FROM
              drep_registration dr) AS latestDeposit ON latestDeposit.drep_hash_id = dh.id
          AND latestDeposit.rn = 1
          LEFT JOIN (
          SELECT
              dr.id,
              dr.drep_hash_id,
              dr.voting_anchor_id,
              ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn,
              tx.hash AS tx_hash
          FROM
              drep_registration dr
                  JOIN tx ON tx.id = dr.tx_id) AS dr_voting_anchor ON dr_voting_anchor.drep_hash_id = dh.id
          AND dr_voting_anchor.rn = 1
          LEFT JOIN (
          SELECT
              dr.id,
              dr.drep_hash_id,
              dr.voting_anchor_id,
              ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn
          FROM
              drep_registration dr) AS second_to_newest_drep_registration ON second_to_newest_drep_registration.drep_hash_id = dh.id
          AND second_to_newest_drep_registration.rn = 2
          LEFT JOIN DRepDistr ON DRepDistr.hash_id = dh.id
          AND DRepDistr.rn = 1
          LEFT JOIN voting_anchor va ON va.id = dr_voting_anchor.voting_anchor_id
          CROSS JOIN DRepActivity
          LEFT JOIN voting_procedure ON voting_procedure.drep_voter = dh.id
          LEFT JOIN tx ON tx.id = voting_procedure.tx_id
          LEFT JOIN block ON block.id = tx.block_id
          LEFT JOIN (
          SELECT
              block.time,
              dr.drep_hash_id,
              ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id DESC) AS rn
          FROM
              drep_registration dr
                  JOIN tx ON tx.id = dr.tx_id
                  JOIN block ON block.id = tx.block_id
          WHERE
              NOT (dr.deposit < 0)) AS newestRegister ON newestRegister.drep_hash_id = dh.id
          AND newestRegister.rn = 1
          LEFT JOIN (
          SELECT
              dr.tx_id,
              dr.drep_hash_id,
              ROW_NUMBER() OVER (PARTITION BY dr.drep_hash_id ORDER BY dr.tx_id ASC) AS rn
          FROM
              drep_registration dr) AS dr_first_register ON dr_first_register.drep_hash_id = dh.id
          AND dr_first_register.rn = 1
          LEFT JOIN tx AS tx_first_register ON tx_first_register.id = dr_first_register.tx_id
          LEFT JOIN block AS block_first_register ON block_first_register.id = tx_first_register.block_id
        ${drepId ? Prisma.sql`WHERE dh.raw = decode(${drepId}, 'hex')` : Prisma.sql``}
    GROUP BY
        dh.raw,
        second_to_newest_drep_registration.voting_anchor_id,
        dh.view,
        va.url,
        va.data_hash,
        dr_deposit.deposit,
        DRepDistr.amount,
        DRepActivity.epoch_no,
        DRepActivity.drep_activity,
        dr_voting_anchor.tx_hash,
        newestRegister.time
    ${status ?
            status === 'Active'?
                    Prisma.sql`HAVING dr_deposit.deposit > 0 AND (DRepActivity.epoch_no - Max(coalesce(block.epoch_no, block_first_register.epoch_no))) <= DRepActivity.drep_activity`:
                    status === 'Inactive'?
                            Prisma.sql`HAVING dr_deposit.deposit > 0 AND (DRepActivity.epoch_no - Max(coalesce(block.epoch_no, block_first_register.epoch_no))) > DRepActivity.drep_activity`:
                            Prisma.sql`HAVING dr_deposit.deposit < 0`: Prisma.sql``
    }
    ${sort==='VotingPower'? Prisma.sql`ORDER BY DRepDistr.amount DESC NULLS LAST`:Prisma.sql`ORDER BY newestRegister.time DESC`}
    OFFSET ${(page?(page-1): 0) * (size?size:10)}
    FETCH NEXT ${size?size:10} ROWS ONLY 
  ` as Record<any,any>[]
  const totalCount = result.length?Number(result[0].total_count):0
  return {items:formatResult(result),totalCount}
}

export const fetchDrepDetails=async(drepId:string)=>{
  const result  = await prisma.$queryRaw`
      WITH DRepId AS (
          SELECT
              decode(${drepId}, 'hex') AS raw
      ),
           AllRegistrationEntries AS (
               SELECT
                   drep_registration.voting_anchor_id AS voting_anchor_id,
                   drep_registration.deposit AS deposit,
                   tx.hash AS tx_hash,
                   tx.id as tx_id
               FROM
                   drep_registration
                       CROSS JOIN DRepId
                       JOIN drep_hash ON drep_hash.id = drep_registration.drep_hash_id
                       JOIN tx ON tx.id = drep_registration.tx_id

               WHERE
                   drep_hash.raw = DRepId.raw
               ORDER BY drep_registration.tx_id asc
           ),
           LatestRegistrationEntry AS (
               SELECT
                   drep_registration.voting_anchor_id AS voting_anchor_id,
                   drep_registration.deposit AS deposit,
                   tx.hash AS tx_hash
               FROM
                   drep_registration
                       CROSS JOIN DrepId
                       JOIN drep_hash ON drep_hash.id = drep_registration.drep_hash_id
                       JOIN tx ON tx.id = drep_registration.tx_id
               WHERE
                   drep_hash.raw = DRepId.raw
               ORDER BY
                   drep_registration.tx_id DESC
          LIMIT 1
          ),
          IsRegisteredAsDRep AS (
      SELECT
          (LatestRegistrationEntry.deposit IS NULL
          OR LatestRegistrationEntry.deposit > 0)
          AND LatestRegistrationEntry.voting_anchor_id IS NOT NULL AS value
      FROM
          LatestRegistrationEntry
          ),
          IsRegisteredAsSoleVoter AS (
      SELECT
          (LatestRegistrationEntry.deposit IS NULL
          OR LatestRegistrationEntry.deposit > 0)
          AND LatestRegistrationEntry.voting_anchor_id IS NULL AS value
      FROM
          LatestRegistrationEntry
          ),
          CurrentDeposit AS (
      SELECT
          GREATEST(drep_registration.deposit, 0) AS value
      FROM
          drep_registration
          JOIN drep_hash ON drep_hash.id = drep_registration.drep_hash_id
          CROSS JOIN DRepId
      WHERE
          drep_registration.deposit IS NOT NULL
        AND drep_hash.raw = DRepId.raw
      ORDER BY
          drep_registration.tx_id DESC
          LIMIT 1
          ),
          WasRegisteredAsDRep AS (
      SELECT
          (EXISTS (
          SELECT
          *
          FROM
          drep_registration
          JOIN drep_hash ON drep_hash.id = drep_registration.drep_hash_id
          CROSS JOIN DRepId
          WHERE
          drep_hash.raw = DRepId.raw
          AND drep_registration.voting_anchor_id IS NOT NULL)) AS value
          ),
          WasRegisteredAsSoleVoter AS (
      SELECT
          (EXISTS (
          SELECT
          *
          FROM
          drep_registration
          JOIN drep_hash ON drep_hash.id = drep_registration.drep_hash_id
          CROSS JOIN DRepId
          WHERE
          drep_hash.raw = DRepId.raw
          AND drep_registration.voting_anchor_id IS NULL)) AS value
          ),
          CurrentMetadata AS (
      SELECT
          voting_anchor.url AS url,
          encode(voting_anchor.data_hash, 'hex') AS data_hash
      FROM
          LatestRegistrationEntry
          LEFT JOIN voting_anchor ON voting_anchor.id = LatestRegistrationEntry.voting_anchor_id
          LIMIT 1
          ),
          CurrentVotingPower AS (
      SELECT
          amount AS amount
      FROM
          drep_hash
          JOIN DRepId ON drep_hash.raw = DRepId.raw
          LEFT JOIN drep_distr ON drep_distr.hash_id = drep_hash.id
      ORDER BY
          drep_distr.epoch_no DESC
          LIMIT 1
          ),
          DRepRegister AS (
      SELECT
          encode(AllRegistrationEntries.tx_hash, 'hex') as tx_hash,
          AllRegistrationEntries.tx_id
      FROM
          (SELECT 1) AS dummy
          LEFT JOIN
          AllRegistrationEntries ON AllRegistrationEntries.voting_anchor_id IS NOT NULL and not (coalesce(deposit,0) < 0)
      ORDER BY
          AllRegistrationEntries.tx_id DESC
          LIMIT 1
          ),
          DRepRetire AS (
      SELECT
          encode(AllRegistrationEntries.tx_hash, 'hex') as tx_hash,
          AllRegistrationEntries.tx_id as tx_id
      FROM
          DRepRegister
          LEFT JOIN
          AllRegistrationEntries ON (AllRegistrationEntries.deposit < 0
          OR AllRegistrationEntries.voting_anchor_id IS NULL)
          and  AllRegistrationEntries.tx_id > DRepRegister.tx_id
      ORDER BY
          AllRegistrationEntries.tx_id asc

          LIMIT 1
          ),

          SoleVoterRegister AS (
      SELECT
          encode(AllRegistrationEntries.tx_hash, 'hex') as tx_hash,
          AllRegistrationEntries.tx_id
      FROM
          (SELECT 1) AS dummy
          LEFT JOIN
          AllRegistrationEntries ON AllRegistrationEntries.voting_anchor_id IS NULL and not (coalesce(deposit,0) < 0)
      ORDER BY
          AllRegistrationEntries.tx_id DESC
          LIMIT 1
          ),
          SoleVoterRetire AS (
      SELECT
          encode(AllRegistrationEntries.tx_hash, 'hex') as tx_hash
      FROM
          SoleVoterRegister
          LEFT JOIN
          AllRegistrationEntries ON (AllRegistrationEntries.deposit < 0
          OR AllRegistrationEntries.voting_anchor_id IS NOT NULL)
          AND AllRegistrationEntries.tx_id > SoleVoterRegister.tx_id
      ORDER BY
          AllRegistrationEntries.tx_id asc

          LIMIT 1
          ),
    DrepDetails AS (SELECT
          IsRegisteredAsDRep.value as "isRegisteredAsDRep",
          WasRegisteredAsDRep.value as "wasRegisteredAsDRep",
          IsRegisteredAsSoleVoter.value as "isRegisteredAsSoleVoter",
          WasRegisteredAsSoleVoter.value as "wasRegisteredAsSoleVoter",
          CurrentDeposit.value as "deposit",
          CurrentMetadata.url as "url",
          CurrentMetadata.data_hash as "dataHash",
          CurrentVotingPower.amount as "votingPower",
          DRepRegister.tx_hash as "dRepRegisterTxHash",
          DRepRetire.tx_hash as "dRepRetireTxHash",
          SoleVoterRegister.tx_hash as "soleVoterRegisterTxHash",
          SoleVoterRetire.tx_hash as "soleVoterRetireTxHash"
      FROM
          IsRegisteredAsDRep
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
          )

      SELECT
          json_build_object(
                  'drep_details',( SELECT row_to_json(DrepDetails) FROM DrepDetails)
          ) as result;
  ` as Record<string,any>[];
  return result[0].result.drep_details?result[0].result.drep_details:result[0].result
}

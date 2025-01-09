import { prisma } from '../config/db'

export const fetchStakeAddressDetails = async (address: string) => {
    const result = (await prisma.$queryRaw`
      WITH address AS (
          SELECT *
          FROM stake_address
          WHERE hash_raw = decode(${address}, 'hex')
      ),
           latest_registration AS (
               SELECT b.epoch_no, b.slot_no, b.block_no, b.time, encode(t.hash, 'hex') AS tx_hash
               FROM stake_registration sr
                        JOIN public.tx t ON t.id = sr.tx_id
                        JOIN public.block b ON b.id = t.block_id
               WHERE sr.addr_id = (SELECT id FROM address)
               ORDER BY b.block_no DESC
          LIMIT 1
          ),
          latest_deregistration AS (
      SELECT b.epoch_no, b.slot_no, b.block_no, b.time, encode(t.hash, 'hex') AS tx_hash
      FROM stake_deregistration sd
          JOIN public.tx t ON t.id = sd.tx_id
          JOIN public.block b ON b.id = t.block_id
      WHERE sd.addr_id = (SELECT id FROM address)
      ORDER BY b.block_no DESC
          LIMIT 1
          )
      
      SELECT
          json_build_object(
                  'registration', (SELECT row_to_json(latest_registration) FROM latest_registration),
                  'deRegistration', (SELECT row_to_json(latest_deregistration) FROM latest_deregistration)
          ) AS result;
  `) as Record<string, any>[]
    return result[0].result
}

export const fetchStakeAddressId = async (hashRawHex: string): Promise<bigint | null> => {
    try {
        const hashRawBuffer = Buffer.from(hashRawHex, 'hex')
        const stakeAddress = await prisma.stake_address.findUnique({
            where: {
                hash_raw: hashRawBuffer,
            },
            select: {
                id: true,
            },
        })
        return stakeAddress?.id || null
    } catch (error) {
        console.error('Error fetching stake_address ID:', error)
        throw new Error('Unable to fetch stake_address ID')
    }
}

export const fetchStakeAddressUtxoSum = async (stakeAddressId: bigint) => {
    try {
        const result = await prisma.$queryRaw<{ sum: string | null }[]>`
        SELECT SUM(value) AS sum
        FROM utxo_view
        WHERE stake_address_id = ${stakeAddressId};
      `

        return result[0]?.sum ? parseFloat(result[0].sum) : 0
    } catch (error) {
        console.error('Error fetching UTXO sum for stake_address_id:', error)
        throw new Error('Unable to fetch UTXO sum for the specified stake_address_id')
    }
}

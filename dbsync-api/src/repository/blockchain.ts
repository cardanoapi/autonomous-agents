import { Prisma } from '@prisma/client'
import { prisma } from '../config/db'

export async function fetchEpochDuration(limit: number) {
    const result = (await prisma.$queryRaw`
        select e.no, e.start_time, e.end_time from epoch e order by e.id desc limit ${limit};
    `) as Record<string, any>[]

    type EpochDurationResponse = {
        epoch: number
        duration: string // in milliseconds
        startTime: string
        endTime: string
    }

    const parsedResult: EpochDurationResponse[] = result.map((epoch) => ({
        epoch: epoch.no,
        duration: (
            BigInt(new Date(epoch.end_time).getTime()) - BigInt(new Date(epoch.start_time).getTime())
        ).toString(),
        startTime: epoch.start_time,
        endTime: epoch.end_time,
    }))

    return parsedResult
}

export async function fetchEpochParams(epoch_no?: number) {
    const result = (await prisma.$queryRaw`
            SELECT
                jsonb_set(
                    ROW_TO_JSON(epoch_param)::jsonb,
                    '{cost_model}', 
                    CASE
                        WHEN cost_model.id IS NOT NULL THEN
                            ROW_TO_JSON(cost_model)::jsonb
                        ELSE
                            'null'::jsonb
                    END
                ) AS epoch_param
            FROM
                epoch_param
            LEFT JOIN
                cost_model ON epoch_param.cost_model_id = cost_model.id
            WHERE epoch_no = ${epoch_no ? epoch_no : Prisma.sql`(SELECT no from epoch order by no desc limit 1)`}
            LIMIT 1;`) as Record<string, any>[]
    return result[0].epoch_param
}

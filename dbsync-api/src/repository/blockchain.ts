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

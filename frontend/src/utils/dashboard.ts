import { ILineChartData } from '@app/components/molecules/chart/CustomLineChart';

export const getFilteredData = (
    data: Record<string, number>,
    filter: string
): ILineChartData[] => {
    const now = new Date();
    let filteredData: ILineChartData[] = [];
    if (filter === 'Last Hour') {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const timestamps = [];

        for (let m = new Date(oneHourAgo); m <= now; m.setMinutes(m.getMinutes() + 1)) {
            timestamps.push(new Date(m).toISOString());
        }

        filteredData = timestamps.map((timestamp) => ({
            name: timestamp,
            amt: data[timestamp] ?? 0
        }));
    } else if (filter === 'Last 24 Hours') {
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const hourlyData: Record<string, number> = {};
        const timestamps = [];

        for (
            let h = new Date(twentyFourHoursAgo);
            h <= now;
            h.setHours(h.getHours() + 1)
        ) {
            const hour = h.toISOString().slice(0, 13) + ':00:00';
            timestamps.push(hour);
            hourlyData[hour] = 0;
        }

        Object.entries(data)
            .filter(([key]) => new Date(key) > twentyFourHoursAgo)
            .forEach(([key, value]) => {
                const hour = new Date(key).toISOString().slice(0, 13) + ':00:00';
                hourlyData[hour] += value;
            });

        filteredData = timestamps.map((timestamp) => ({
            name: timestamp,
            amt: hourlyData[timestamp] ?? 0
        }));
    }

    return filteredData;
};

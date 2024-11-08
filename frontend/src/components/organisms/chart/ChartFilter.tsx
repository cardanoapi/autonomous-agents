import { ILineChartData } from "./CustomLineChart";

export interface IChartFilterOption {
    placeholder: string;
    unit: string;
    xaxisInterval: number;
}

export function formatArrayIntoChartData(li: number[]): ILineChartData[] {
    const formatedData: ILineChartData[] = li.map((item, index) => ({
        name: `a${index}`,
        amt: item
    }));
    return formatedData;
}

export const chartFilterOptions: IChartFilterOption[] = [
    {
        placeholder: 'Last Hour',
        unit: 'Mins',
        xaxisInterval: 5
    },
    {
        placeholder: 'Last 24 Hours',
        unit: 'Hours',
        xaxisInterval: 2
    },
    {
        placeholder: 'Last 7 Days',
        unit: 'Days',
        xaxisInterval: 0
    }
];

export function convertDictToGraphDataFormat(
    arr: { count: number; values: Record<string, number> }[],
    chartUnit: string
): ILineChartData[] {
    let timeStampCalculator: (val: number) => string;
    let xAxisTickGenerator: (val: number) => string;

    switch (chartUnit) {
        case 'Mins':
            timeStampCalculator = (val: number) =>
                new Date(Date.now() - val * 60000).toTimeString();
            xAxisTickGenerator = (val: number) => {
                const date = new Date(Date.now() - val * 60000);
                return (
                    appendZeroIfRequired(date.getHours()) +
                    ':' +
                    appendZeroIfRequired(date.getMinutes())
                );
            };
            break;
        case 'Hours':
            timeStampCalculator = (val: number) =>
                new Date(Date.now() - val * 3600000).toTimeString();
            xAxisTickGenerator = (val: number) => {
                const date = new Date(Date.now() - val * 3600000);
                return (
                    appendZeroIfRequired(date.getHours()) +
                    ':' +
                    appendZeroIfRequired(date.getMinutes())
                );
            };
            break;
        case 'Days':
            timeStampCalculator = (val: number) =>
                new Date(Date.now() - val * 86400000).toDateString();
            xAxisTickGenerator = (val: number) => {
                const dateParts = new Date(Date.now() - val * 86400000)
                    .toDateString()
                    .split(' ');
                return dateParts.slice(1, 3).join(' ');
            };
            break;
        default:
            throw new Error('Invalid chart unit');
    }

    return arr.map((item, index) => ({
        name: timeStampCalculator(index),
        amt: item.count,
        xaxisTick: xAxisTickGenerator(index),
        toolTipFooter: (
            <div>
                {Object.entries(item.values).map(([key, value], valueIndex) => (
                    <div key={valueIndex}>
                        <span className="h-5 text-brand-Gray-50">
                            {key}(<span className="text-green-400">{value}</span>)
                        </span>
                    </div>
                ))}
            </div>
        )
    }));
}

function appendZeroIfRequired(n: number) {
    return n.toString().length === 1 ? `0${n}` : n;
}

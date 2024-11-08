import { ILineChartData } from "@app/components/organisms/chart/CustomLineChart";

export function formatArrayIntoChartData(li: number[]): ILineChartData[] {
    const formatedData: ILineChartData[] = li.map((item, index) => ({
        name: `a${index}`,
        amt: item
    }));
    return formatedData;
}

import { baseAPIurl } from './config';

export interface ITriggerHistoryMetric {
    function_name: string[];
    successful_triggers: number;
    unsuccessful_triggers: number;
    skipped_triggers: number;
    last_hour_successful_triggers: number[];
    last_24hour_successful_triggers: number[];
    last_week_successful_triggers: number[];
    today_fluctuation_rate: number;
}

export const fecthTriggerHistoryMetric = async (functions: string[]) : Promise<ITriggerHistoryMetric> => {
    let fetchURL = `${baseAPIurl}/trigger-metric`;
    if (functions.length > 0) {
        const queryParams = functions
            .map((func) => `function_name=${encodeURIComponent(func)}`)
            .join('&');
        fetchURL += `?${queryParams}`;
    }
    const res = fetch(fetchURL);
    console.log(fetchURL);
    const data = (await res).json();
    return data;
};

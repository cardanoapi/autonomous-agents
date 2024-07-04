import { baseAPIurl } from './config';

export interface ITriggerHistoryMetric {
    function_name: string[];
    successfull_triggers: { [key: string]: number };
    no_of_successful_triggers: number;
    no_of_unsuccessful_triggers: number;
    no_of_skipped_triggers: number;
    last_hour_successful_triggers: number[];
    last_24hour_successful_triggers: number[];
    last_week_successful_triggers: number[];
    today_fluctuation_rate: number;
}

export const fecthTriggerHistoryMetric = async (
    functions: string[]
): Promise<ITriggerHistoryMetric> => {
    let fetchURL = `${baseAPIurl}/trigger-metric`;
    if (functions.length > 0) {
        const queryParams = functions
            .map((func) => `function_name=${encodeURIComponent(func)}`)
            .join('&');
        fetchURL += `?${queryParams}`;
    }
    console.log(fetchURL);
    const res = fetch(fetchURL);
    console.log(fetchURL);
    const data = (await res).json();
    return data;
};

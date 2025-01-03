import { baseAPIurl } from './config';

export interface ITriggerHistoryMetric {
    function_name: string[];
    no_of_successful_triggers: number;
    no_of_unsuccessful_triggers: number;
    no_of_skipped_triggers: number;
    last_hour_successful_triggers: { count: number; values: Record<string, number> }[];
    last_24hour_successful_triggers: {
        count: number;
        values: Record<string, number>;
    }[];
    last_week_successful_triggers: { count: number; values: Record<string, number> }[];
    today_fluctuation_rate: number;
}

export const fecthTriggerHistoryMetric = async (
    functions: string[],
    agent_id?: string
): Promise<ITriggerHistoryMetric> => {
    let fetchURL = `${baseAPIurl}/trigger-metric`;
    if (functions.length > 0) {
        const queryParams = functions.map((func) => `function_name=${encodeURIComponent(func)}`).join('&');
        fetchURL += `?${queryParams}`;
    }
    if (agent_id && agent_id?.length >= 0) {
        fetchURL += functions.length == 0 ? `?agent_id=${agent_id}` : `&agent_id=${agent_id}`;
    }
    const res = fetch(fetchURL);
    const data = (await res).json();
    return data;
};

import { baseAPIurl } from "./config";

export const fetchAgents = async () => {
    const res = await fetch(`${baseAPIurl}/templates/triggers`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
};
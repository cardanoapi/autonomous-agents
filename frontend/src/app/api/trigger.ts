import { baseAPIurl } from "./config";

export interface ITrigger{
    id :string, 
    template_id : string,
    type : string,
    action : {
        function_name : string,
        parameter : {name: string , value: string}[]
    }
    data : {
        frequency : string,
        probability : number
    }
}

export const fetchtriggersbyTemplateID = async (templateID : string) => {
    const res = await fetch(`${baseAPIurl}/templates/${templateID}/trigger`);
    if (!res.ok) {
        throw new Error('Trigger Fetch failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const fetchSuccessfullTriggersbyAgentID = async (agentID : string) => {
    const res = await fetch(`${baseAPIurl}/transaction-counts/${agentID}/agent?&success=true`);
    if (!res.ok) {
        throw new Error('Trigger Fetch failed: Network Error');
    }
    const data = await res.json();
    return data;
}

export const fetchUnSuccessfullTriggersbyAgentID = async (agentID : string) => {
    const res = await fetch(`${baseAPIurl}/transaction-counts/${agentID}/agent?success=false`);
    if (!res.ok) {
        throw new Error('Trigger Fetch Failed: Network Error');
    }
    const data = await res.json();
    const count = Object.keys(data).length;
    return data;
}

export const fetchTransactionsCount = async (transactionState: string ) => {
    const res = await fetch(`${baseAPIurl}/transaction-counts/?success=${transactionState}`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    const count = Object.keys(data).length;
    return data;
}

export const fetchTriggers = async ( ) => {
    const res = await fetch(`${baseAPIurl}/templates/trigger`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
}

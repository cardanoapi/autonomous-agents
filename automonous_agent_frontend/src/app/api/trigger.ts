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
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
};

export const fetchSuccessfullTriggersbyAgentID = async (agentID : string) => {
    const res = await fetch(`${baseAPIurl}/transaction-counts/{agent-id}/agent?agent_id=${agentID}&success=true`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    return data;
}

export const fetchUnSuccessfullTriggersbyAgentID = async (agentID : string) => {
    const res = await fetch(`${baseAPIurl}/transaction-counts/{agent-id}/agent?agent_id=${agentID}&success=false`);
    if (!res.ok) {
        throw new Error('Agents Fetch Operation failed: Network Error');
    }
    const data = await res.json();
    const count = Object.keys(data).length;
    console.log(data)
    return data;
}
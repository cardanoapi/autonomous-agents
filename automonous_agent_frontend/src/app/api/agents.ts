"use client"

import { baseAPIurl } from './config';


export interface IAgent {
  id : string,
  name : string,
  templateID : string
  instance : number
  index : number
  last_active : string
  active : boolean | null
}

export const fetchAgents = async () : Promise<IAgent[]> => {
  const res = await fetch(`${baseAPIurl}/agents/`)
  if (!res.ok) {
    throw new Error('Agents Fetch Operation failed: Network Error');
  }
  const data = await res.json();
  return data;
};


export const fetchActiveAgentsCount = async() => {
  const res = await fetch(`${baseAPIurl}/agents/online/`)
  if (!res.ok){
    throw new Error('Active Agents Fetch Opetation failed: Network Error')
  }
  const data = await res.json()
  return data
}
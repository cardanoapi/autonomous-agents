"use client"

import { baseAPIurl } from './config';

export const fetchAgents = async () => {
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
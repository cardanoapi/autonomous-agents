"use client"

import { baseAPIurl } from './config';

export const fetchAgentsList = async () => {
  const url = `${baseAPIurl}/agents/`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Agents Fetch Operation failed: Network Error');
  }
  const data = await res.json();
  return data;
};

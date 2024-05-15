"use client"

import { baseAPIurl } from './config';


export interface ITemplate{
  id : string
  name : string
  description : string
}

export const fetchTemplates = async () : Promise<ITemplate[]>  => {
  const res = await fetch(`${baseAPIurl}/templates/`)
  if (!res.ok) {
    throw new Error('Templates Fetch Operation failed: Network Error');
  }
  const data = await res.json();
  return data;
};

export const fetchTemplatebyID = async(templateid : string) =>{
    return templateid
}
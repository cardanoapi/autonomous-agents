import { ParameterizedMessageObject, Span, Transaction } from "elastic-apm-node";

export const apm = require('elastic-apm-node')


function apmConfig(){
  if(process.env.ELASTIC_APM_SERVER_URL && process.env.ELASTIC_APM_API_KEY && process.env.ELASTIC_APM_ENVIRONMENT){
   return {
     ELASTIC_APM_SERVER_URL: process.env.ELASTIC_APM_SERVER_URL,
     ELASTIC_APM_API_KEY: process.env.ELASTIC_APM_API_KEY,
     ELASTIC_APM_ENVIRONMENT: process.env.ELASTIC_APM_ENVIRONMENT
   }
  }
}

export const startTransaction= (...args: any[]): Transaction=>{
  return apm.startTransaction(...args);
}
export const captureError= (err: Error | string | ParameterizedMessageObject)=>{
  return apm.captureError(err)
}
export const startSpan = (...args: any[]) : Span | any =>{
  return apm.startSpan(...args);
}
export function formatResult(result:Array<Record<string,any>>){
  return result.map((item)=>item.result)
}
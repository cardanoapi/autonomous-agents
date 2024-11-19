import { convertToBufferIfBech32 } from './cardano'
import { BooleanOperator, ComparisonOperator } from '../types/eventTriger'
import * as buffer from "buffer";
import { logicalFunctions } from "./operatorSupport";

const NetworkName = ['preview', 'preprod', 'sanchonet']

export function validateToken(token: string) {
    if (token.split('_').length !== 2) {
        return 'Not a valid token. Missing secret key'
    }
    if (token.split('_')[1].includes('undefined')) {
        return 'Not a valid token. Missing secret key'
    }
    if (!NetworkName.includes(token.split('_')[0]))
        return 'Not a valid network name'
    return ''
}

export function reduceBooleanArray(
    bools: Array<boolean>,
    reducer: BooleanOperator,
    negate: boolean
) : boolean {
    let reducedBooleanLogic
    if (reducer === 'AND') {
        reducedBooleanLogic = bools.reduce((acc, bool) => acc && bool, true)
    } else if (reducer === 'OR') {
        reducedBooleanLogic = bools.reduce((acc, bool) => acc || bool, false)
    }
    return negate ? !reducedBooleanLogic : !!reducedBooleanLogic
}

export function compareValue(
    operator: ComparisonOperator,
    objectProperty: any,
    txPropertyVal: any,
    property_path:string[]
) {
      if(txPropertyVal.constructor.name == 'Buffer')
        console.debug(`compareValue[${property_path.join('.')}] (${operator},0x${txPropertyVal.toString('hex')}, ${objectProperty})`)
      else
        console.debug(`compareValue[${property_path.join('.')}] (${operator},${txPropertyVal}, ${objectProperty})`)

    let filterValue = convertToBufferIfBech32(objectProperty)
    console.debug("filterValue=",filterValue);
    let result;
    result =  logicalFunctions.execute(operator,txPropertyVal,filterValue)


    if(txPropertyVal.constructor.name == 'Buffer')
        console.debug(`compareValue[${property_path.join('.')}] (${operator},0x${txPropertyVal.toString('hex')}, ${objectProperty}) = ${result}`)
    else
        console.debug(`compareValue[${property_path.join('.')}] (${operator},${txPropertyVal}, ${objectProperty}) = ${result}`)
    return  result


}
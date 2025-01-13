import { BooleanOperator, ComparisonOperator } from '../types/eventTriger'
import { logicalFunctions } from './operatorSupport'

const NetworkName = ['preview', 'preprod', 'sanchonet']

export function validateToken(token: string) {
    if (token.split('_').length < 1) {
        return 'Not a valid token. Missing secret key'
    }
    if (token.split('_')[1].includes('undefined')) {
        return 'Not a valid token. Missing secret key'
    }
    return ''
}

export function reduceBooleanArray(bools: Array<boolean>, reducer: BooleanOperator, negate: boolean): boolean {
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
    property_path: string[]
) {
    console.debug('filterValue=' + objectProperty + ', txPropertyVal= ' + txPropertyVal)
    const result = logicalFunctions.execute(operator, txPropertyVal, objectProperty)

    if (txPropertyVal.constructor.name == 'Buffer') {
        console.debug(
            `compareValue[${property_path.join('.')}] (${operator},0x${txPropertyVal.toString('hex')}, ${objectProperty}) = ${result}`
        )
    } else
        console.debug(
            `compareValue[${property_path.join('.')}] (${operator},${txPropertyVal}, ${objectProperty}) = ${result}`
        )
    return result
}

export function customReplacer(key: any, value: any) {
    if (typeof value === 'bigint') {
        return value.toString() // Convert BigInt to string
    }
    return value // Return the value unchanged for other types
}

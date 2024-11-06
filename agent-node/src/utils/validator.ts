import { convertToBufferIfBech32 } from './cardano'
import { BooleanOperator, ComparisonOperator } from '../types/eventTriger'

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
) {
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
    filterValue: any,
    txPropertyVal: any
) {
    filterValue = convertToBufferIfBech32(filterValue)
    switch (operator) {
        case 'greaterThan':
            if (Array.isArray(txPropertyVal)) {
                return txPropertyVal.some((item) => filterValue > item)
            }
            return filterValue > txPropertyVal
        case 'lessThan':
            if (Array.isArray(txPropertyVal)) {
                return txPropertyVal.some((item) => filterValue < item)
            }
            return filterValue < txPropertyVal
        case 'equals':
            if (Array.isArray(txPropertyVal)) {
                return txPropertyVal.some(
                    (item) => !Buffer.compare(filterValue, item)
                )
            }
            return !Buffer.compare(filterValue, txPropertyVal)
        case 'in':
            if (Array.isArray(txPropertyVal)) {
                return txPropertyVal.includes(filterValue)
            }
            return false
        default:
            return false
    }
}

export function getPropertyValue(initial_value: any, keys: Array<string>) {
    return keys.reduce((acc, key) => {
        if (Array.isArray(acc)) {
            return acc.map((item) => item[key]).filter(Boolean)
        } else {
            return acc && acc[key] != undefined ? acc[key] : undefined
        }
    }, initial_value)
}

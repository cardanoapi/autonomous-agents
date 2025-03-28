import { FunctionContext } from '../executor/BaseFunction'

export function handler(contex: FunctionContext, a: any, b: any) {
    console.log('Sum of two value a and b is: ' + Number(a) + Number(b))
    return Number(a) + Number(b)
}

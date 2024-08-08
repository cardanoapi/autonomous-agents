import axios from 'axios'
import { FunctionContext } from '../executor/BaseFunction'

export default async function handler(
    context: FunctionContext,
    url: any,
    data: any
) {
    axios.post(url, data)
}

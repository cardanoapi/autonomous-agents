import { FunctionContext } from '../executor/BaseFunction'
import axios from 'axios'

export default async function builtin(context: FunctionContext, url: string, data: Record<any, any> | any[] | string) {
    return axios.post(url, typeof data == 'string' ? data : JSON.stringify(data))
}

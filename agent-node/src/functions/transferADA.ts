import { FunctionContext } from '../executor/BaseFunction'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export const schema: FunctionSchemaSpec = {
    id: 'transferADA',
    name: 'Transfer ADA',
    description: 'Send ADA to a receiver address from this agent',
    params: [
        { name: 'receiver_address', schema: { type: 'string', description: 'Bech32 receiver address' } },
        { name: 'receiving_ada', schema: { type: 'number', description: 'Amount in ADA' } },
    ],
    response: {
        type: 'object',
        properties: {
            cborHex: { type: 'string' },
            description: { type: 'string' },
            hash: { type: 'string' },
            type: { type: 'string' },
        },
        response_text: 'Tx Submitted: hash: ${result.hash}', // template
    },
}

export default async function handler(context: FunctionContext, receiverAddress: string, receivingAda: number) {
    const req = {
        outputs: {
            address: receiverAddress,
            value: `${receivingAda}A`,
        },
    }
    return await context.wallet
        .buildAndSubmit(req)
        .then((v) => v)
        .catch((err) => {
            console.log('Transfer ADA Error : ', err)
            throw err
        })
}

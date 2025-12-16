import { z } from 'zod'

// json schema type
export interface FunctionParamSchmea {
    name: string
    schema: {
        type: 'string' | 'number' | 'object' | 'address' | 'hash' | 'boolean' | 'url' | 'list'
        description?: string
        optional?: boolean
    }
}

export interface FunctionSchemaSpec {
    id: string
    name?: string
    description?: string
    response?: {
        type: string
        description?: string
        properties?: Record<string, any>
        required?: string[]
        response_text?: string // template
    }
    params: FunctionParamSchmea[]
}

function zObject() {
    return z.union([
        z.record(z.any()),
        z.string().refine(
            (s) => {
                try {
                    const v = JSON.parse(s)
                    return typeof v === 'object' && v !== null && !Array.isArray(v)
                } catch {
                    return false
                }
            },
            { message: 'Invalid object' }
        ),
    ])
}

function zArray() {
    return z.union([
        z.array(z.any()),
        z.string().refine(
            (s) => {
                try {
                    return Array.isArray(JSON.parse(s))
                } catch {
                    return false
                }
            },
            { message: 'Invalid JSON for list parameter' }
        ),
    ])
}

export function zodFromParam(p: FunctionParamSchmea) {
    const { type, description, optional } = p.schema
    let base =
        type === 'number'
            ? z.coerce.number()
            : type === 'boolean'
              ? z.coerce.boolean()
              : type === 'object'
                ? zObject()
                : type === 'list'
                  ? zArray()
                  : z.string()

    if (type === 'address') base = base.describe('Bech32 address')
    if (type === 'hash') base = base.describe('Hex-encoded hash')
    if (type === 'url') base = base.describe('URL')

    const withDesc = description ? base.describe(description) : base
    return optional ? withDesc.optional() : withDesc
}
/*
number → z.number()
boolean → z.boolean()
everything else (string/address/hash/url) → z.string() with helpful describe hints.
*/

export function buildZodInputShape(schema: FunctionSchemaSpec) {
    return schema.params.reduce<Record<string, z.ZodTypeAny>>((shape, p) => {
        shape[p.name] = zodFromParam(p)
        return shape
    }, {})
}
/*
Example for transferADA:
{ receiver_address: z.string().describe('Bech32 receiver address'), 
 receiving_ada: z.number().describe('Amount in ADA') }
*/

export function argsToRunnerParams(schema: FunctionSchemaSpec, args: Record<any, unknown>) {
    return schema.params.map((p) => {
        const v = args[p.name]
        const t = p.schema.type
        let value: any

        if (v === undefined || v === null) {
            value = t === 'object' ? {} : ''
        } else if (t === 'number') {
            value = typeof v === 'number' ? v : Number(v)
        } else if (t === 'boolean') {
            value = typeof v === 'boolean' ? v : String(v).toLowerCase() === 'true'
        } else if (t === 'object') {
            // if a JSON string is provided, parse it; otherwise keep object
            value = typeof v === 'string' ? safeJsonParse(v, v) : v
        } else if (t === 'list') {
            // accept array or JSON string for list
            if (Array.isArray(v)) {
                value = v
            } else if (typeof v === 'string') {
                const parsed = safeJsonParse(v, v)
                value = Array.isArray(parsed) ? parsed : []
            } else {
                value = []
            }
        } else {
            value = typeof v === 'string' ? v : String(v)
        }

        return { name: p.name, value }
    })
}

function safeJsonParse(input: string, fallback: any) {
    try {
        return JSON.parse(input)
    } catch {
        return fallback
    }
}

// args into runners array
/*
[{ name: 'receiver_address', value: 'addr...' }, 
 { name: 'receiving_ada', value: '3' }]
*/

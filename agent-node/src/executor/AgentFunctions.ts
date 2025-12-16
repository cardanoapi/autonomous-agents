import fs from 'fs'
import path from 'path'
import { FunctionSchemaSpec } from '../utils/functionSchema'

export interface FunctionHolder {
    [key: string]: any
}
export interface FunctionGroup {
    functions: FunctionHolder
    builtins: FunctionHolder
    filters: FunctionHolder
}
// Helper function to require modules with extensions automatically
function requireModule(filePath: string) {
    // Try `.js` first
    try {
        return require(`${filePath}.js`)
    } catch (err) {
        // Try `.ts` if `.js` is not available
        try {
            return require(`${filePath}.ts`)
        } catch (err: any) {
            throw new Error(`Cannot load module ${filePath}: ${err.message}`)
        }
    }
}

// Function to load all handlers
function loadHandlersSync(directory: string): FunctionGroup {
    const handlers: FunctionHolder = {}
    const builtins: FunctionHolder = {}
    const filters: FunctionHolder = {}

    // Get the list of files in the directory
    const files = fs.readdirSync(directory)
    // Process each file
    files.forEach((file) => {
        // Get the file name without the extension
        const baseFileName = path.basename(file, path.extname(file))
        // Construct the file path without the extension
        const filePath = path.join(directory, baseFileName)

        // Check if the file has a .js or .ts extension
        if (['.js', '.ts'].includes(path.extname(file))) {
            try {
                // Use the helper function to require the module
                const module: any = requireModule(filePath)
                // Check if the module exports a `handler` function
                const handler = module.handler || module.default
                const filter = module.filter
                if (typeof handler === 'function') {
                    handlers[baseFileName] = handler
                }
                if (module.builtin || handler.name == 'builtin') {
                    builtins[baseFileName] = module.builtin || module.default
                }
                if (filter && typeof filter == 'function') {
                    filters[baseFileName] = filter
                }
            } catch (error) {
                console.error(`Failed to load handler from file ${filePath}:`, error)
            }
        }
    })

    return {
        functions: handlers,
        builtins: builtins,
        filters: filters,
    }
}

// Define the relative directory path from the location of this file
const relativeDirectoryPath = '../functions'
const directoryPath = path.resolve(__dirname, relativeDirectoryPath)

// discover per-function schema
export function getFunctionSchemas(): Record<string, FunctionSchemaSpec> {
    const schmeas: Record<string, FunctionSchemaSpec> = {}
    const files = fs.readdirSync(directoryPath) // reads the func dir synchronously -> "../functions"
    files.forEach((file) => {
        if (!['.js', '.ts'].includes(path.extname(file))) return // filter
        const baseFileName = path.basename(file, path.extname(file)) // base file name without extension
        const filePath = path.join(directoryPath, baseFileName) // build total path
        try {
            const module: any = requireModule(filePath) // require wrapper
            const schema = module.schema as Partial<FunctionSchemaSpec> | undefined
            if (schema && typeof schema === 'object') {
                // guarding
                const id = schema.id || baseFileName
                schmeas[id] = {
                    id,
                    name: schema.name || id,
                    description: schema.description || '',
                    response: schema.response,
                    params: Array.isArray(schema.params) ? schema.params : [],
                }
            }
        } catch (e) {
            console.error(`Failed to load meta from ${filePath}:`, e)
        }
    })
    return schmeas
}
// Returns a map like:
// schemas = { transferADA: { id: 'transferADA', name: 'Transfer ADA', …, params: [...] } }

// Export the function
export function getHandlers(): FunctionGroup {
    return loadHandlersSync(directoryPath)
}

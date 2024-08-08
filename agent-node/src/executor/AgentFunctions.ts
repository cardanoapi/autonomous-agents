import fs from 'fs'
import path from 'path'

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
function loadHandlersSync(directory: string): { [key: string]: Function } {
    const handlers: { [key: string]: Function } = {}

    // Get the list of files in the directory
    const files = fs.readdirSync(directory)
    console.log('Function files:', JSON.stringify(files))

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
                const module = requireModule(filePath)
                // Check if the module exports a `handler` function
                const handler = module.handler || module.default
                if (typeof handler === 'function') {
                    handlers[baseFileName] = handler
                }
                console.log(module)
            } catch (error) {
                console.error(
                    `Failed to load handler from file ${filePath}:`,
                    error
                )
            }
        }
    })
    console.log(handlers)
    return handlers
}

// Define the relative directory path from the location of this file
const relativeDirectoryPath = '../functions'
const directoryPath = path.resolve(__dirname, relativeDirectoryPath)

// Export the function
export function getHandlers() {
    return loadHandlersSync(directoryPath)
}

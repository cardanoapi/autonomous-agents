import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { AgentRunner } from '../executor/AgentRunner'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { globalState } from '../constants/global'
import { TriggerType } from '../service/triggerService'
import { getFunctionSchemas } from '../executor/AgentFunctions'
import { buildZodInputShape, argsToRunnerParams } from '../utils/functionSchema'
import { createSamplingGate, SamplingGate } from './sampling'
import { CreateAutoVoteTool } from './autoVoteTool'

export function startMcpServer(
    manager: ManagerInterface,
    runners: AgentRunner[],
    port = Number(process.env.MCP_HTTP_PORT || 7071)
) {
    const app = express()
    app.use(express.json())
    app.use(
        cors({
            origin: '*', // tighten for production
            exposedHeaders: ['Mcp-Session-Id'],
            allowedHeaders: ['Content-Type', 'mcp-session-id'],
        })
    )

    // template render
    function renderTemplate(tpl: string, ctx: Record<string, any>) {
        return tpl.replace(/\$\{([^}]+)\}/g, (_, expr) => {
            const path = expr.trim().split('.')
            let cur: any = ctx
            for (const key of path) {
                if (cur == null) return ''
                cur = cur[key]
            }
            return cur == null ? '' : String(cur)
        })
    }

    // in memory store
    const lastResults = new Map<
        string,
        {
            summary: string
            hash?: string
            timestamp: string
        }
    >()

    let samplingGate: SamplingGate = async () => ({ execute: true, reason: 'no MCP session' })

    // http endpoint
    app.post('/sampling/event-gate', async (req, res) => {
        try {
            const { function_name, parameters, eventPreview } = req.body || {}
            const decision = await samplingGate(function_name, { parameters, eventPreview })
            res.json(decision)
        } catch (e) {
            console.warn('[MCP] /sampling/event-gate error', e)
            res.status(200).json({ execute: true, reason: 'sampling-error' })
        }
    })

    // Hold active transports by session
    const transports: Record<string, StreamableHTTPServerTransport> = {}

    // Factory that wires the MCP server and binds to a transport
    const buildServer = async (transport: StreamableHTTPServerTransport) => {
        const server = new McpServer({ name: 'aat-agent', version: '0.1.0' })

        // sampling for extra checks
        samplingGate = createSamplingGate(server)

        // resources : results after tool call
        server.registerResource(
            'last-result',
            new ResourceTemplate('aat://last-result/{tool}', { list: undefined }),
            {
                title: 'Tool Result',
                description: 'return the result of the tool call',
                mimeType: 'application/json',
            },
            async (uri, { tool }) => {
                const entry = lastResults.get(tool as string)
                const payload = entry ? { tool, ...entry } : { error: `No value is stored '${tool}'` }
                return { contents: [{ uri: uri.href, text: JSON.stringify(payload, null, 2) }] }
            }
        )

        // aggregate resource
        server.registerResource(
            'last-results',
            'aat://last-results',
            {
                title: 'All Tool Last Results',
                description: 'Summary + hash + timestamp for each tool',
                mimeType: 'application/json',
            },
            async (uri) => {
                const all = [...lastResults.entries()].map(([tool, v]) => ({ tool, ...v }))
                return { contents: [{ uri: uri.href, text: JSON.stringify(all, null, 2) }] }
            }
        )

        //  return context.manager.fetchProposals(page, pageSize, search, sort)

        // *** 1) Tools -> invoke via runner (same as manual trigger)
        const schemas = getFunctionSchemas()
        for (const [name, schema] of Object.entries(schemas)) {
            // obj -> array of [key,value] yoo array lai loop
            server.registerTool(
                name,
                {
                    description: schema.description,
                    inputSchema: buildZodInputShape(schema),
                },
                async (args: Record<string, unknown>) => {
                    console.log('[MCP]', name, 'request', { args })
                    if (!runners.length) {
                        return { content: [{ type: 'text', text: 'No agent runners available.' }], isError: true }
                    }
                    // sampling GATE

                    let gate = { execute: true, reason: 'not evaluated' }

                    try {
                        gate = await samplingGate(name, args)
                    } catch (e) {
                        console.warn('MCP SAMPLING GATED ERROR bro', e)
                    }

                    if (!gate.execute) {
                        const summary = `Blocked by sampling: ${gate.reason}`
                        lastResults.set(name, {
                            summary,
                            timestamp: new Date().toISOString(),
                        })

                        return {
                            content: [
                                { type: 'text', text: summary },
                                {
                                    type: 'resource_link',
                                    uri: `aat://last-result/${encodeURIComponent(name)}`,
                                    name: `${name} result`,
                                    mimeType: 'application/json',
                                    description: 'latest execution result',
                                },
                            ],
                        }
                    }

                    const runner = runners[0]
                    // maps args to ui/cron shaped
                    //const params = [
                    //   { name: 'receiver_address', value: String(receiver_address) },
                    //   { name: 'receiving_ada', value: String(receiving_ada) },
                    // ]
                    const params = argsToRunnerParams(schema, args)
                    try {
                        console.log('[MCP] invoking runner.invokeFunction', {
                            method: name,
                            args: params,
                            description: schema.description,
                        })
                        // elicitation: TODO

                        const result = await runner.invokeFunction('MANUAL' as TriggerType, 0, name, ...params)
                        const summary = schema.response?.response_text
                            ? renderTemplate(schema.response.response_text, { result, args })
                            : `${name} queued.`

                        const txHash = result && typeof result === 'object' ? (result as any).hash : undefined
                        // persist
                        lastResults.set(name, {
                            summary,
                            hash: txHash,
                            timestamp: new Date().toISOString(),
                        })

                        return {
                            content: [
                                { type: 'text', text: summary },
                                {
                                    type: 'resource_link',
                                    uri: `aat://last-result/${encodeURIComponent(name)}`,
                                    name: `${name} result`,
                                    mimeType: 'application/json',
                                    description: 'latest execution result',
                                },
                            ],
                        }
                    } catch (err: any) {
                        console.error('[MCP]', name, 'error', err)
                        return {
                            content: [{ type: 'text', text: `Error: ${err?.message || String(err)}` }],
                            isError: true,
                        }
                    }
                }
            )
        }

        // Auto Vote Tool
        CreateAutoVoteTool(server, manager, runners)

        // 2) Resource: agent config snapshot
        server.registerResource(
            'agent-config',
            'agent://config',
            {
                title: 'Agent Configuration Snapshot',
                description: 'Current system prompt and per-function LLM preferences.',
                mimeType: 'application/json',
            },
            async (uri) => {
                const snapshot = {
                    system_prompt: globalState.systemPrompt || null,
                    llm_function_prefs: globalState.functionLLMSettings || {},
                }
                return {
                    contents: [{ uri: uri.href, text: JSON.stringify(snapshot, null, 2) }],
                }
            }
        )

        // 3) Prompt: agent_system (per-agent system prompt)
        server.registerPrompt(
            'agent_system',
            {
                title: 'Agent System Prompt',
                description: 'The current system prompt for this agent process.',
                argsSchema: {}, // no args
            },
            () => ({
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: globalState.systemPrompt || 'No system prompt configured.',
                        },
                    },
                ],
            })
        )

        await server.connect(transport)
        return server
    }

    // Streamable HTTP transport with session management
    app.post('/mcp', async (req, res) => {
        // Reuse by session ID if provided
        const sessionId = (req.headers['mcp-session-id'] as string | undefined) || undefined

        let transport: StreamableHTTPServerTransport
        if (sessionId && transports[sessionId]) {
            transport = transports[sessionId]
        } else {
            // Create a new session
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                // check false, for local vs code client
                enableDnsRebindingProtection: false,
                onsessioninitialized: (sid) => {
                    transports[sid] = transport
                },
            })
            // Clean up when closed
            transport.onclose = () => {
                if (transport.sessionId) {
                    delete transports[transport.sessionId]
                }
            }
            await buildServer(transport)
        }

        await transport.handleRequest(req, res, req.body)
    })

    // GET for SSE notifications
    app.get('/mcp', async (req, res) => {
        const sessionId = (req.headers['mcp-session-id'] as string | undefined) || undefined
        if (!sessionId || !transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID')
            return
        }
        await transports[sessionId].handleRequest(req, res)
    })

    // DELETE to terminate a session
    app.delete('/mcp', async (req, res) => {
        const sessionId = (req.headers['mcp-session-id'] as string | undefined) || undefined
        if (!sessionId || !transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID')
            return
        }
        await transports[sessionId].handleRequest(req, res)
    })

    app.listen(port, () => {
        console.log(`[MCP] Streamable HTTP listening at http://localhost:${port}/mcp`)
    })
}

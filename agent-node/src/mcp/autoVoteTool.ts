import { globalState } from '../constants/global'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'
import { z } from 'zod'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { AgentRunner } from '../executor/AgentRunner'
import { argsToRunnerParams } from '../utils/functionSchema'
import { getFunctionSchemas } from '../executor/AgentFunctions'
import { TriggerType } from '../service/triggerService'

export function CreateAutoVoteTool(server: McpServer, manager: ManagerInterface, runners: AgentRunner[]) {
    return server.registerTool(
        'autoVoteByPolicy',
        {
            description: 'Fetch proposals, decide via system prompt (sampling), then vote on allowed ones.',
            inputSchema: {
                page: z.number().default(1).describe('Page number'),
                size: z.number().default(5).describe('Page size'),
                dryRun: z.boolean().optional().default(false).describe('Only report decisions; do not submit votes'),
            },
        },
        // fetch proposal from the agentManager
        async ({ page, size, dryRun }: { page?: number; size?: number; dryRun?: boolean }) => {
            page = page || 1
            size = size || 5
            dryRun = !!dryRun
            console.log('[MCP] calling manager.fetchProposals', { page, size, search: '', sort: 'CreatedDate' })

            //RPC CALL --> fetching proposal
            let proposalsRes: any
            try {
                proposalsRes = await manager.fetchProposals(page, size, '', 'CreatedDate')
                console.log('[MCP] fetchProposals resolved', {
                    hasItems: Array.isArray(proposalsRes?.items),
                    count: proposalsRes?.items?.length,
                    keys: Object.keys(proposalsRes || {}),
                })
            } catch (e: any) {
                console.error('[MCP] fetchProposals error (raw)', e, 'typeof=', typeof e)
                console.error('[MCP] fetchProposals error (stringified)', String(e))
                return { content: [{ type: 'text', text: 'Rpc fetchProposal error:' + e.message }], isError: true }
            }
            // data validation
            console.log('PROPOSAL RESPONSE AFTER FETCH', proposalsRes)
            const items = proposalsRes?.items || []
            if (!items.length) {
                return { content: [{ type: 'text', text: 'No proposals found' }] }
            }

            const results: any[] = []
            // sequential loop, could try promise.all()
            for (const [idx, p] of items.entries()) {
                const proposalId = `${p.createdAt.tx}#${p.createdAt.index}`
                const type = p.proposal?.type || 'Unknown'
                const title = p.meta?.title || '(no title)'

                // sampling
                const sys = (globalState.systemPrompt || '').trim()
                const decisionPrompt = `Policy:
${sys || '(empty)'}

Consider proposal:
- id: ${proposalId}
- type: ${type}
- title: ${title}

Return ONLY JSON:
{"execute": true|false, "vote": "yes|no|abstain", "reason": "short"}
Rules:
- Follow system prompt
- if system prompt allows then vote or else execute=false
`

                console.log(`[MCP][sampling] #${idx + 1}/${items.length} proposalId=${proposalId}`)
                console.log('[MCP][sampling] prompt=', decisionPrompt)
                // default
                const decision = { execute: true, vote: 'abstain', reason: 'default' }
                // llm invoke through sampling
                try {
                    const sres: any = await (server as any).server.createMessage({
                        messages: [{ role: 'user', content: { type: 'text', text: decisionPrompt } }],
                        maxTokens: 300,
                    })

                    const text =
                        sres?.content?.type === 'text' ? sres.content.text : JSON.stringify(sres?.content || {})

                    console.log('[MCP][sampling] model text=', text)

                    // extract the first json object, response processing
                    const match = text?.match(/\{[\s\S]*\}/)
                    if (match) {
                        try {
                            const parsed = JSON.parse(match[0])
                            console.log('[MCP][sampling] parsed=', parsed)

                            // decision validation
                            if (typeof parsed.execute === 'boolean') decision.execute = parsed.execute
                            if (parsed.vote && ['yes', 'no', 'abstain'].includes(String(parsed.vote).toLowerCase()))
                                decision.vote = String(parsed.vote).toLowerCase()
                            if (parsed.reason) decision.reason = parsed.reason
                        } catch (pe) {
                            console.warn('[MCP][sampling] JSON parse failed:', pe)
                        }
                    } else {
                        console.warn('[MCP][sampling] no JSON object found in model text')
                    }
                } catch (e) {
                    console.warn('[MCP][sampling] sampling error; defaulting allow/abstain', e)
                    // sampling failed; keep default allow/abstain
                }
                console.log('[MCP][sampling] decision=', decision)

                // execution gate
                if (!decision.execute) {
                    console.log('[MCP] blocked by sampling, proposalId=', proposalId, 'decision=', decision)
                    results.push({ proposalId, type, decision, status: 'blocked' })
                    continue
                }

                if (dryRun) {
                    console.log('[MCP] dryRun, proposalId=', proposalId, 'decision=', decision)
                    results.push({ proposalId, type, decision, status: 'allowed (dryRun)' })
                    continue
                }

                // normalize anchor param to object {} so handler auto-generates anchor
                const schema = getFunctionSchemas()['voteOnProposal']
                const params = argsToRunnerParams(schema, { proposal: proposalId, anchor: {}, voteType: decision.vote })
                // Ensure anchor is object (handler can auto-generate anchor)
                for (const pParam of params)
                    if (pParam.name === 'anchor' && (typeof pParam.value !== 'object' || !pParam.value))
                        pParam.value = ''
                console.log('[MCP][runner] voteOnProposal params=', params)

                try {
                    console.log('[MCP][runner] invoking voteOnProposal for', proposalId)
                    const r = await runners[0].invokeFunction('MANUAL' as TriggerType, 0, 'voteOnProposal', ...params)
                    console.log('[MCP][runner] voteOnProposal result=', r)
                    results.push({ proposalId, type, decision, status: 'voted', hash: r?.hash })
                } catch (err: any) {
                    console.error('[MCP][runner] voteOnProposal error=', err)
                    results.push({ proposalId, type, decision, status: 'error', error: String(err?.message || err) })
                }
            }
            console.log('[MCP] autoVoteByPolicy results=', results)
            return {
                content: [{ type: 'text', text: `autoVoteByPolicy processed ${results.length} proposals` }],
                isError: false,
                additionalProperties: { results },
            }
        }
    )
}

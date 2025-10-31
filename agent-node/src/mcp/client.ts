export type EventGateDecision = { execute: boolean; reason: string }

export async function callEventGate(
    functionName: string,
    parameters: any[],
    eventPreview: string
): Promise<EventGateDecision> {
    const port = Number(process.env.MCP_HTTP_PORT || 7071)
    const url = `http://localhost:${port}/sampling/event-gate`
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ function_name: functionName, parameters, eventPreview }),
    })
    if (!res.ok) {
        return { execute: true, reason: `http ${res.status}` }
    }
    return (await res.json()) as EventGateDecision
}

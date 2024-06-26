export type AgentWalletDetails = {
    agent_address: string
    payment_signing_key: string
    stake_signing_key: string
    stake_verification_key_hash: string
    payment_verification_key_hash: string
    drep_id: string
}

export const globalState: { agentWalletDetails: AgentWalletDetails | null } = {
    agentWalletDetails: null,
}

export const AgentWithTriggerTypeEvent: {
    eventType: boolean
    function_name: string
} = {
    eventType: false,
    function_name: '',
}

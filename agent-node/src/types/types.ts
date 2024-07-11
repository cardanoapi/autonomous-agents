export type AgentWalletDetails = {
    agent_address: string
    payment_signing_key: string
    stake_signing_key: string
    stake_verification_key_hash: string
    payment_verification_key_hash: string
    drep_id: string
}

export type EventTriggerTypeDetails = {
    eventType: boolean
    function_name: string
}

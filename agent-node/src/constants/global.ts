import { IEventBasedAction } from '../types/eventTriger'

export const globalState: {
    eventTriggerTypeDetails: IEventBasedAction[]
    agentName: string
    systemPrompt: string
    functionLLMSettings: any
} = {
    eventTriggerTypeDetails: [],
    agentName: '',
    systemPrompt: '',
    functionLLMSettings: {},
}

export const globalRootKeyBuffer: { value: Buffer | null } = {
    value: null,
}

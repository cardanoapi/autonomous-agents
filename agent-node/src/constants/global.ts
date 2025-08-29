import { IEventBasedAction } from '../types/eventTriger'

export const globalState: {
    eventTriggerTypeDetails: IEventBasedAction[]
    agentName: string
    systemPrompt:string
    functionLLMSettings: Record<
        string,
        { enabled: boolean; userPrefText: string; prefs?: any }
    >
} = {
    eventTriggerTypeDetails: [],
    agentName: '',
    systemPrompt:'',
    functionLLMSettings: {}
}

export const globalRootKeyBuffer: { value: Buffer | null } = {
    value: null,
}

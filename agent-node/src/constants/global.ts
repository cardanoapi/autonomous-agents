import { IEventBasedAction } from '../types/eventTriger'

export const globalState: {
    eventTriggerTypeDetails: IEventBasedAction[]
    agentName: string
} = {
    eventTriggerTypeDetails: [],
    agentName: '',
}

export const globalRootKeyBuffer: { value: Buffer | null } = {
    value: null,
}

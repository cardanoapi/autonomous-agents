import { IEventBasedAction } from '../types/eventTriger'

export const globalState: {
    eventTypeDetails: IEventBasedAction[]
    agentName: string
} = {
    eventTypeDetails: [],
    agentName: '',
}

export const globalRootKeyBuffer: { value: Buffer | null } = {
    value: null,
}

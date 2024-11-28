import { EventTriggerTypeDetails } from '../types/types'

export const globalState: {
    eventTriggerTypeDetails: EventTriggerTypeDetails
    agentName: string
} = {
    eventTriggerTypeDetails: {
        eventType: false,
        function_name: '',
        parameters: [],
    },
    agentName: '',
}

export const globalRootKeyBuffer: { value: Buffer | null } = {
    value: null,
}

import { EventTriggerTypeDetails } from '../types/types'

export const globalState: {
    eventTriggerTypeDetails: EventTriggerTypeDetails
} = {
    eventTriggerTypeDetails: {
        eventType: false,
        function_name: '',
    },
}

export const globalRootKeyBuffer: { value: Buffer | null } = {
    value: null,
}

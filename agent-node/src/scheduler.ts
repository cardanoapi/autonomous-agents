import { globalState } from './global'
import cron, { ScheduledTask } from 'node-cron'
import { sendDataToWebSocket } from '.'
import kuberService from './transaction-service'

// Define the types for the action parameter and action
export interface ActionParameter {
    name: string
    value: string
}

export interface Action {
    parameter: ActionParameter[]
    function_name: string
}

export interface Data {
    frequency: string
    probability: number
}

export interface Configuration {
    id: string
    type: string
    data: Data
    action: Action
}
let scheduledTasks: ScheduledTask[] = []

function clearScheduledTasks() {
    scheduledTasks.forEach((task) => {
        task.stop()
    })

    scheduledTasks = []
}
function sendActionToWebSocket(
    action: Action,
    trigger: boolean,
    payload: any = null
) {
    const actionWithTrigInfo = {
        action,
        messageType: 'action',
        trigger: trigger.toString(),
        payload,
    }
    sendDataToWebSocket(JSON.stringify(actionWithTrigInfo))
}

function getParameterValue(
    parameters: ActionParameter[] = [],
    name: string
): string {
    const param = parameters.find((param) => param.name === name)
    return param ? param.value : ''
}

function createTask(action: Action, frequency: string, probability: number) {
    return cron.schedule(frequency, () => {
        triggerAction(action, probability)
    })
}

export async function triggerAction(action: Action, probability: number) {
    if (Math.random() > probability || !globalState.agentWalletDetails) {
        sendActionToWebSocket(action, false)
    } else {
        const agentAddress = globalState.agentWalletDetails?.agent_address || ''
        let payload
        switch (action.function_name) {
            case 'SendAda Token':
                payload = kuberService.transferADA(
                    [getParameterValue(action.parameter, 'Receiver Address')],
                    10,
                    globalState.agentWalletDetails.agent_address,
                    globalState.agentWalletDetails.payment_signing_key
                )
                break
            case 'Delegation':
                payload = kuberService.stakeDelegation(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash,
                    getParameterValue(action.parameter, 'drep') || 'abstain'
                )
                break
            case 'Vote':
                payload = kuberService.voteOnProposal(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    globalState.agentWalletDetails.drep_id,
                    globalState.agentWalletDetails.stake_signing_key,
                    getParameterValue(action.parameter, 'proposal') || ''
                )
                break
            case 'Info Action Proposal':
                payload = kuberService.createInfoGovAction(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    getParameterValue(action.parameter, 'anchor_url'),
                    getParameterValue(action.parameter, 'anchor_datahash'),
                    globalState.agentWalletDetails.stake_verification_key_hash
                )
                break
            case 'Proposal New Constitution':
                payload = kuberService.proposeNewConstitution(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    globalState.agentWalletDetails.stake_signing_key,
                    getParameterValue(action.parameter, 'anchor_url'),
                    getParameterValue(action.parameter, 'anchor_dataHash'),
                    getParameterValue(action.parameter, 'newConstitution_url'),
                    getParameterValue(
                        action.parameter,
                        'newConstitution_dataHash'
                    )
                )
                break
            case 'Drep Registration':
                payload = kuberService.dRepRegistration(
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash,
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key
                )
                break
            case 'Drep deRegistration':
                payload = kuberService.dRepDeRegistration(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash
                )
                break
            case 'Register Stake':
                payload = kuberService.registerStake(
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash,
                    globalState.agentWalletDetails.payment_signing_key,
                    agentAddress
                )
                break
            case 'Abstain Delegation':
                payload = kuberService.abstainDelegations(
                    [globalState.agentWalletDetails.stake_signing_key],
                    [
                        globalState.agentWalletDetails
                            .stake_verification_key_hash,
                    ],
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key
                )
                break
            default:
                return
        }
        sendActionToWebSocket(action, true, payload)
    }
}

export async function scheduleFunctions(configurations: Configuration[]) {
    clearScheduledTasks()

    configurations.forEach((config) => {
        const { data, action } = config
        if (action) {
            const { frequency, probability } = data
            const task = createTask(action, frequency, probability)
            scheduledTasks.push(task)
        }
    })
}

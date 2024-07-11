import { ManagerInterface } from './ManagerInterfaceService'
import { AgentTransactionBuilder } from './transactionBuilder'

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

export type TriggerType = 'MANUAL' | 'EVENT' | 'CRON'

function getParameterValue(
    parameters: ActionParameter[] = [],
    name: string
): string {
    const param = parameters.find((param) => param.name === name)
    return param ? param.value : ''
}

export async function triggerAction(
    function_name: string,
    parameter: ActionParameter[]
): Promise<any> {
    const transactionBuilder = AgentTransactionBuilder.getInstance()
    const managerInterface = ManagerInterface.getInstance()
    let body: any
    if (!managerInterface) {
        console.error('Manager Interface Instance not Found')
        process.exit(1)
    }
    if (!transactionBuilder) {
        console.error('Transaction Builder Instance not Found')
        process.exit(1)
    }
    switch (function_name) {
        case 'SendAda Token':
            body = transactionBuilder.transferADA(
                getParameterValue(parameter, 'Receiver Address'),
                10
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                console.log('error is : ', err)
                throw err
            })
        case 'Delegation':
            body = transactionBuilder.stakeDelegation(
                getParameterValue(parameter, 'drep') || 'abstain'
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                console.log('error is : ', err)
                throw err
            })
        case 'Vote':
            body = transactionBuilder.voteOnProposal(
                getParameterValue(parameter, 'proposal') || '',
                getParameterValue(parameter, 'anchorUrl') || '',
                getParameterValue(parameter, 'anchorHash') || ''
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (err && err.message.includes('GovActionsDoNotExist')) {
                    throw new Error('Governance Action Proposal doesnot exist')
                } else {
                    throw err
                }
            })
        case 'Info Action Proposal':
            body = transactionBuilder.createInfoGovAction(
                getParameterValue(parameter, 'anchor_url'),
                getParameterValue(parameter, 'anchor_datahash')
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        case 'Proposal New Constitution':
            body = transactionBuilder.proposalNewConstitution(
                getParameterValue(parameter, 'anchor_url'),
                getParameterValue(parameter, 'anchor_dataHash'),
                getParameterValue(parameter, 'newConstitution_url'),
                getParameterValue(parameter, 'newConstitution_dataHash')
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        case 'Drep Registration':
            body = transactionBuilder.dRepRegistration()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (
                    err &&
                    err.message.includes('ConwayDRepAlreadyRegistered')
                ) {
                    throw new Error(`Drep is already registered`)
                } else {
                    throw err
                }
            })
        case 'Drep deRegistration':
            body = transactionBuilder.dRepDeRegistration()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (err && err.message.includes('Drep  is not registered ')) {
                    throw new Error('Drep is not registered.')
                } else {
                    throw err
                }
            })
        case 'Register Stake':
            body = transactionBuilder.registerStake()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (err && err.message.includes('StakeKeyRegisteredDELEG')) {
                    throw new Error('Stake is already registered')
                } else {
                    throw err
                }
            })
        case 'Abstain Delegation':
            body = transactionBuilder.abstainDelegations()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        case 'No Confidence':
            body = transactionBuilder.noConfidence()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        default:
            return
    }
}

import { ManagerInterface } from './ManagerInterfaceService'
import { AgentTransactionBuilder } from './transactionBuilder'

export interface ActionParameter {
    name: string
    value: string
}

export interface Action {
    parameters: ActionParameter[]
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

export type TriggerType = 'MANUAL' | 'EVENT' | 'CRON' | ''

function getParameterValue(
    parameters: ActionParameter[] = [],
    name: string
): any {
    const param = parameters.find((param) => param.name === name)
    return param ? param.value : ''
}

export async function triggerAction(
    triggerHandler: any,
    managerInterface: ManagerInterface,
    function_name: string,
    parameters: ActionParameter[],
    triggerType: TriggerType
): Promise<any> {
    const transactionBuilder = AgentTransactionBuilder.getInstance()
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
        case 'transferADA':
            body = transactionBuilder.transferADA(
                getParameterValue(parameters, 'receiver_address'),
                getParameterValue(parameters, 'receiving_ada')
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                console.log('error is : ', err)
                throw err
            })
        case 'stakeDelegation':
            body = transactionBuilder.stakeDelegation(
                getParameterValue(parameters, 'drep') || 'abstain'
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (err && err.message.includes('StakeKeyNotRegisteredDELEG')) {
                    triggerHandler.setTriggerOnQueue(
                        { function_name: 'registerStake', parameters: [] },
                        ''
                    )
                    triggerHandler.setTriggerOnQueue(
                        {
                            function_name: 'stakeDelegation',
                            parameters: parameters,
                        },
                        triggerType
                    )
                    throw new Error('Skip')
                } else {
                    throw err
                }
            })
        case 'voteOnProposal':
            body = transactionBuilder.voteOnProposal(
                getParameterValue(parameters, 'proposal') || '',
                getParameterValue(parameters, 'anchor_url') || '',
                getParameterValue(parameters, 'anchor_datahash') || ''
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (err && err.message.includes('GovActionsDoNotExist')) {
                    throw new Error('Governance Action Proposal doesnot exist')
                } else if (err && err.message.includes('VotersDoNotExist')) {
                    triggerHandler.setTriggerOnQueue(
                        { function_name: 'dRepRegistration', parameters: [] },
                        ''
                    )
                    triggerHandler.setTriggerOnQueue(
                        {
                            function_name: 'voteOnProposal',
                            parameters: parameters,
                        },
                        triggerType
                    )
                    throw new Error('Skip')
                } else {
                    throw err
                }
            })
        case 'createInfoGovAction':
            body = transactionBuilder.createInfoGovAction(
                getParameterValue(parameters, 'anchor_url'),
                getParameterValue(parameters, 'anchor_datahash')
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        case 'proposalNewConstitution':
            body = transactionBuilder.proposalNewConstitution(
                getParameterValue(parameters, 'anchor_url'),
                getParameterValue(parameters, 'anchor_dataHash'),
                getParameterValue(parameters, 'newConstitution_url'),
                getParameterValue(parameters, 'newConstitution_dataHash')
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        case 'dRepRegistration':
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
        case 'dRepDeRegistration':
            body = transactionBuilder.dRepDeRegistration()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (err && err.message.includes('Drep  is not registered ')) {
                    throw new Error('Drep is not registered.')
                } else {
                    throw err
                }
            })
        case 'registerStake':
            body = transactionBuilder.registerStake()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (err && err.message.includes('StakeKeyRegisteredDELEG')) {
                    throw new Error('Stake is already registered')
                } else {
                    throw err
                }
            })
        case 'stakeDeRegistration':
            body = transactionBuilder.stakeDeRegistration()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (
                    err &&
                    err.message.includes('Stake address is not registered')
                ) {
                    throw new Error('Stake Address is not registered.')
                } else {
                    throw err
                }
            })
        case 'abstainDelegation':
            body = transactionBuilder.abstainDelegation()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        case 'noConfidence':
            body = transactionBuilder.noConfidence()
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        default:
            return
    }
}

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

export type TriggerType = 'MANUAL' | 'EVENT' | 'CRON' | 'INTERNAL' | ''

function getParameterValue(
    parameters: ActionParameter[] = [],
    name: string
): any {
    const param = parameters.find((param) => param.name === name)
    return param ? param.value : ''
}

function mergeObjectsValueIntoSingleObject(
    values: Array<Record<string, string>>,
    recordString1: string,
    recordString2: string,
    recordString2Type: 'string' | 'number'
) {
    const objectsMap = new Map()
    values.forEach((val) =>
        objectsMap.set(
            val[recordString1],
            recordString2Type === 'number'
                ? +val[recordString2]
                : val[recordString2]
        )
    )
    return Object.fromEntries(objectsMap)
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
    let anchor: any
    let anchorUrl: any
    let anchorDataHash: any
    let proposal: any
    let newConstitution: any
    let newConstitutionDataHAsh: any
    let newConstitutionUrl: any
    let quorum: any
    let quorumDenominator: any
    let quorumNumerator: any
    let withdrawal: any
    let removingCommittee: any
    let addingCommittee: any
    let guardRailScript: any

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
                        'INTERNAL'
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
            proposal = getParameterValue(parameters, 'proposal') || ''
            anchor = getParameterValue(parameters, 'anchor') || []
            anchorUrl = getParameterValue(anchor, 'url') || ''
            anchorDataHash = getParameterValue(anchor, 'dataHash') || ''
            body = transactionBuilder.voteOnProposal(
                proposal,
                anchorUrl,
                anchorDataHash
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                if (err && err.message.includes('GovActionsDoNotExist')) {
                    throw new Error('Governance Action Proposal doesnot exist')
                } else if (err && err.message.includes('VotersDoNotExist')) {
                    triggerHandler.setTriggerOnQueue(
                        { function_name: 'dRepRegistration', parameters: [] },
                        'INTERNAL'
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
                getParameterValue(parameters, 'url'),
                getParameterValue(parameters, 'dataHash')
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })
        case 'proposalNewConstitution':
            anchor = getParameterValue(parameters, 'anchor') || []
            anchorUrl = getParameterValue(anchor, 'url')
            anchorDataHash = getParameterValue(anchor, 'dataHash')
            newConstitution =
                getParameterValue(parameters, 'newConstitution') || []
            newConstitutionUrl = getParameterValue(newConstitution, 'url')
            newConstitutionDataHAsh = getParameterValue(
                newConstitution,
                'dataHash'
            )
            guardRailScript =
                getParameterValue(parameters, 'guardrailScript') || undefined
            body = transactionBuilder.proposalNewConstitution(
                anchorUrl,
                anchorDataHash,
                newConstitutionUrl,
                newConstitutionDataHAsh,
                guardRailScript
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })

        case 'noConfidence':
            anchor = getParameterValue(parameters, 'anchor') || []
            anchorUrl = getParameterValue(anchor, 'url')
            anchorDataHash = getParameterValue(anchor, 'dataHash')
            body = transactionBuilder.noConfidence(anchorUrl, anchorDataHash)
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })

        case 'treasuryWithdrawal':
            anchor = getParameterValue(parameters, 'anchor') || []
            anchorUrl = getParameterValue(anchor, 'url')
            anchorDataHash = getParameterValue(anchor, 'dataHash')
            withdrawal = mergeObjectsValueIntoSingleObject(
                getParameterValue(parameters, 'withdrawal'),
                'stakeAddress',
                'amount',
                'number'
            )
            body = transactionBuilder.treasuryWithdrawal(
                anchorUrl,
                anchorDataHash,
                withdrawal
            )
            return managerInterface.buildTx(body, true).catch((err: Error) => {
                throw err
            })

        case 'updateCommittee':
            anchor = getParameterValue(parameters, 'anchor') || []
            anchorUrl = getParameterValue(anchor, 'url')
            anchorDataHash = getParameterValue(anchor, 'dataHash')
            quorum = getParameterValue(parameters, 'quorum')
            quorumNumerator = getParameterValue(quorum, 'numerator') || 0
            quorumDenominator = getParameterValue(quorum, 'numerator') || 0
            removingCommittee = getParameterValue(parameters, 'remove') || []
            addingCommittee = mergeObjectsValueIntoSingleObject(
                getParameterValue(parameters, 'add'),
                'credential',
                'active_epoch',
                'number'
            )
            body = transactionBuilder.updateCommittee(
                anchorUrl,
                anchorDataHash,
                +quorumNumerator,
                +quorumDenominator,
                addingCommittee,
                removingCommittee
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
        default:
            return
    }
}

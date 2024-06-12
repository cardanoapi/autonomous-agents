import axios from 'axios'
import { saveTriggerHistory } from '../repository/trigger_history_repository'
import { createOrUpdateFunctionDetail } from '../repository/fucntion_details_repository'
import { checkDrepStatus } from '../helper/delegateRep'
import { checkStakeReg } from '../helper/stakeReg'
import { kuberApiKey, kuberBaseUrl } from '../config/environments'

const ApiUrl = process.env.API_SERVER
interface Parameter {
    name: string
    value: string
}

interface FunctionData {
    parameter: Parameter[]
    function_name: string
    trigInfo: string
}

interface Selection {
    type?: string
    description?: string
    cborHex?: string
}

interface Proposal {
    deposit?: any
    refundAccount?: {
        network?: any
        credential?: {
            'key hash'?: any
        }
    }
    anchor?: {
        url: any
        dataHash: any
    }
    newconstitution?: {
        url: any
        dataHash: any
    }
}

interface RequestBody {
    selections: (string | Selection)[]
    proposals?: Proposal[]
    outputs?: {
        address: string
        value: string
    }[]
    certificates?: {
        type: string
        key: string
        drep: any
    }[]
    vote?: {
        voter: string
        role: string
        proposal: any
        vote: boolean
        anchor: {
            url: any
            dataHash: any
        }
    }[]
}

const agentFunctionMap: { [agentId: string]: Set<string> } = {}

export const handleTransaction = async (
    message: any,
    agentId: string
): Promise<void> => {
    if (message != 'Ping' || message == 'proposal') {
        // Parse the JSON string into a JavaScript object
        const data: FunctionData = JSON.parse(message)
        // Function to get the value of a parameter by its name
        function getParameterValue(name: string): string | undefined {
            const param = data.parameter.find((param) => param.name === name)
            return param ? param.value : undefined
        }

        if (!agentFunctionMap[agentId]) {
            agentFunctionMap[agentId] = new Set()
        }
        agentFunctionMap[agentId].add(data.function_name)
        data.function_name == 'kuber/api/tx/build'
        if (data.function_name == 'Proposal New Constitution') {
            if (data.trigInfo == 'true') {
                await createOrUpdateFunctionDetail(
                    'Proposal New Constitution',
                    true
                )
                const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`
                const addressResponse = await axios.get(addressApiUrl)
                const agentAddress = addressResponse.data.agent_address
                const agentCborhex = addressResponse.data.payment_signing_key
                const kuberUrl = `${kuberBaseUrl}/tx?submit=true`

                const body: RequestBody = {
                    selections: [
                        agentAddress,
                        {
                            type: 'PaymentSigningKeyShelley_ed25519',
                            description: 'Payment Signing Key',
                            cborHex: agentCborhex,
                        },
                    ],
                    proposals: [
                        {
                            anchor: {
                                url: getParameterValue('anchor_url'),
                                dataHash: getParameterValue('anchor_dataHash'),
                            },
                            newconstitution: {
                                url: getParameterValue('newConstitution_url'),
                                dataHash: getParameterValue(
                                    'newConstitution_dataHash'
                                ),
                            },
                        },
                    ],
                }

                try {
                    const response = await fetch(kuberUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Api-Key': kuberApiKey,
                        },
                        body: JSON.stringify(body),
                    })

                    if (!response.ok) {
                        const responseBody = await response.text() // Get the response body as text
                        throw new Error(
                            `Proposal New Constitution Transaction failed : ${response.status}. ${responseBody}`
                        )
                    }
                    const kuberData = await response.json()
                    console.log('Kuber Response:', kuberData)
                    await saveTriggerHistory(
                        agentId,
                        data.function_name,
                        true,
                        true,
                        'Successful Creation of transaction of New Constitution Proposal'
                    )
                } catch (error: any) {
                    console.error(
                        'Error submitting transaction:',
                        error.message
                    )
                    await saveTriggerHistory(
                        agentId,
                        data.function_name,
                        true,
                        false,
                        error.message
                    )
                }
            } else {
                await saveTriggerHistory(
                    agentId,
                    data.function_name,
                    false,
                    false,
                    ''
                )
            }
        } else if (data.function_name == 'SendAda Token') {
            if (data.trigInfo == 'true') {
                await createOrUpdateFunctionDetail('SendAda Token', true)
                const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`
                const addressResponse = await axios.get(addressApiUrl)
                const agentAddress = addressResponse.data.agent_address
                const agentCborhex = addressResponse.data.payment_signing_key
                const requestBody: RequestBody = {
                    selections: [
                        agentAddress,
                        {
                            type: 'PaymentSigningKeyShelley_ed25519',
                            description: 'Payment Signing Key',
                            cborHex: agentCborhex,
                        },
                    ],
                    outputs: [
                        {
                            address: getParameterValue('Receiver Address')!,
                            value: '10A',
                        },
                    ],
                }

                const headers = {
                    'Content-Type': 'application/json',
                    'api-key': kuberApiKey,
                }
                const kuberUrlSendAda = `${kuberBaseUrl}/tx?submit=true`
                try {
                    const response = await fetch(kuberUrlSendAda, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody),
                    })

                    if (!response.ok) {
                        const responseBody = await response.text() // Get the response body as text
                        throw new Error(
                            `SendAda Token Transaction failed ${response.status}. ${responseBody}`
                        )
                    }
                    const kuberData = await response.json()
                    console.log('Kuber Response Send Ada Token:', kuberData)
                    await saveTriggerHistory(
                        agentId,
                        data.function_name,
                        true,
                        true,
                        'Successful Creation of transaction of Send Ada Transaction'
                    )
                } catch (error: any) {
                    console.error(
                        'Error submitting transaction:',
                        error.message
                    )
                    await saveTriggerHistory(
                        agentId,
                        data.function_name,
                        true,
                        false,
                        error.message
                    )
                }
            } else {
                await saveTriggerHistory(
                    agentId,
                    data.function_name,
                    false,
                    false,
                    ''
                )
            }
        } else if (data.function_name == 'Delegation') {
            const status = await checkStakeReg(
                kuberBaseUrl,
                ApiUrl,
                agentId,
                kuberApiKey
            )
            if (await status) {
                await createOrUpdateFunctionDetail('Delegation', true)
                const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`
                const addressResponse = await axios.get(addressApiUrl)
                const agentAddress = addressResponse.data.agent_address
                const paymentCborHex = addressResponse.data.payment_signing_key
                const stakeCborHex = addressResponse.data.stake_signing_key
                const ownerKeyHash =
                    addressResponse.data.stake_verification_key_hash
                const requestBody: RequestBody = {
                    selections: [
                        agentAddress,
                        {
                            type: 'PaymentSigningKeyShelley_ed25519',
                            description: 'Payment Signing Key',
                            cborHex: paymentCborHex,
                        },
                        {
                            type: 'PaymentSigningKeyShelley_ed25519',
                            description: 'Payment Signing Key',
                            cborHex: stakeCborHex,
                        },
                    ],
                    certificates: [
                        {
                            type: 'delegate',
                            key: ownerKeyHash,
                            drep: getParameterValue('drep'),
                        },
                    ],
                }
                const headers = {
                    'Content-Type': 'application/json',
                    'api-key': kuberApiKey,
                }
                const kuberUrlDelegation = `${kuberBaseUrl}/tx?submit=true`

                try {
                    const response = await fetch(kuberUrlDelegation, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody),
                    })

                    if (!response.ok) {
                        const responseBody = await response.text() // Get the response body as text
                        throw new Error(
                            `Proposal delegation Token Transaction failed ${response.status}. ${responseBody}`
                        )
                    }

                    const kuberData = await response.json()
                    console.log(
                        'Kuber Response proposal delegation :',
                        kuberData
                    )
                    await saveTriggerHistory(
                        agentId,
                        data.function_name,
                        true,
                        true,
                        'Successful Creation of Delegation of Proposal'
                    )
                } catch (error: any) {
                    console.error(
                        'Error submitting transaction:',
                        error.message
                    )
                    await saveTriggerHistory(
                        agentId,
                        data.function_name,
                        true,
                        false,
                        error.message
                    )
                }
            } else {
                await saveTriggerHistory(
                    agentId,
                    data.function_name,
                    false,
                    false,
                    ''
                )
            }
        } else if (data.function_name == 'Vote') {
            if (data.trigInfo == 'true') {
                const status = await checkDrepStatus(
                    kuberBaseUrl,
                    ApiUrl,
                    agentId,
                    kuberApiKey
                )
                if (status) {
                    await createOrUpdateFunctionDetail('Vote', true)
                    const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`
                    const addressResponse = await axios.get(addressApiUrl)
                    const agentAddress = addressResponse.data.agent_address
                    const paymentCborHex =
                        addressResponse.data.payment_signing_key
                    const stakeCborHex = addressResponse.data.stake_signing_key
                    const ownerKeyHash = addressResponse.data.drep_id
                    const requestBody: RequestBody = {
                        selections: [
                            agentAddress,
                            {
                                type: 'PaymentSigningKeyShelley_ed25519',
                                description: 'Payment Signing Key',
                                cborHex: paymentCborHex,
                            },
                            {
                                type: 'PaymentSigningKeyShelley_ed25519',
                                description: 'Payment Signing Key',
                                cborHex: stakeCborHex,
                            },
                        ],
                        vote: [
                            {
                                voter: ownerKeyHash,
                                role: 'drep',
                                proposal: getParameterValue('proposal'),
                                vote: true,
                                anchor: {
                                    url: 'https://bit.ly/3zCH2HL',
                                    dataHash:
                                        '1111111111111111111111111111111111111111111111111111111111111111',
                                },
                            },
                        ],
                    }
                    const headers = {
                        'Content-Type': 'application/json',
                        'api-key': kuberApiKey,
                    }
                    const kuberUrlDelegation = `${kuberBaseUrl}/tx?submit=true`

                    try {
                        const response = await fetch(kuberUrlDelegation, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(requestBody),
                        })

                        if (!response.ok) {
                            const responseBody = await response.text() // Get the response body as text
                            throw new Error(
                                `Voting transaction failed ${response.status}. ${responseBody}`
                            )
                        }

                        const kuberData = await response.json()
                        console.log('Kuber Vote Response:', kuberData)
                        await saveTriggerHistory(
                            agentId,
                            data.function_name,
                            true,
                            true,
                            'Successful vote'
                        )
                    } catch (error: any) {
                        console.error(
                            'Error submitting transaction:',
                            error.message
                        )
                        await saveTriggerHistory(
                            agentId,
                            data.function_name,
                            true,
                            false,
                            error.message
                        )
                    }
                } else {
                    console.log('waiting.........')
                }
            } else {
                await saveTriggerHistory(
                    agentId,
                    data.function_name,
                    false,
                    false,
                    ''
                )
            }
        } else if (data.function_name == 'Info Action Proposal') {
            if (data.trigInfo == 'true') {
                await createOrUpdateFunctionDetail('Info Action Proposal', true)
                const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`
                const addressResponse = await axios.get(addressApiUrl)
                const agentAddress = addressResponse.data.agent_address
                const agentCborhex = addressResponse.data.agent_private_key
                const ownerKeyHash = addressResponse.data.agent_key_hash
                const requestBody: RequestBody = {
                    selections: [
                        agentAddress,
                        {
                            type: 'PaymentSigningKeyShelley_ed25519',
                            description: 'Payment Signing Key',
                            cborHex: agentCborhex,
                        },
                    ],
                    proposals: [
                        {
                            deposit: '100A',
                            refundAccount: {
                                network: 'Testnet',
                                credential: {
                                    'key hash': ownerKeyHash,
                                },
                            },
                            anchor: {
                                url: getParameterValue('anchor_url'),
                                dataHash: getParameterValue('anchor_datahash'),
                            },
                        },
                    ],
                }

                const headers = {
                    'Content-Type': 'application/json',
                    'api-key': kuberApiKey,
                }
                const kuberUrlDelegation = `${kuberBaseUrl}/tx?submit=true`

                try {
                    const response = await fetch(kuberUrlDelegation, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody),
                    })

                    if (!response.ok) {
                        const responseBody = await response.text() // Get the response body as text
                        throw new Error(
                            `Info proposal Transaction failed ${response.status}. ${responseBody}`
                        )
                    }

                    const kuberData = await response.json()
                    console.log('Kuber Response:', kuberData)
                    await saveTriggerHistory(
                        agentId,
                        data.function_name,
                        true,
                        true,
                        'Successful Creation of Info Action Proposal'
                    )
                } catch (error: any) {
                    console.error(
                        'Error submitting transaction:',
                        error.message
                    )
                    await saveTriggerHistory(
                        agentId,
                        data.function_name,
                        true,
                        false,
                        error.message
                    )
                }
            } else {
                await saveTriggerHistory(
                    agentId,
                    data.function_name,
                    false,
                    false,
                    ''
                )
            }
        }
    }
}

export const stopFunctionsWhenAgentDisconnects = async (agentId: string) => {
    const functions = agentFunctionMap[agentId]
    if (functions) {
        for (const functionName of functions) {
            await createOrUpdateFunctionDetail(functionName, false)
        }
        delete agentFunctionMap[agentId]
    }
}

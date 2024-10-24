import environments from '../config/environments'
import { saveTriggerHistory } from '../repository/trigger_history_repository'

const kuberBaseUrl = environments.kuberBaseUrl
const kuberApiKey = environments.kuberApiKey

interface Parameter {
    name: string
    value: string
}

type TriggerType = 'CRON' | 'MANUAL' | 'EVENT'

interface FunctionData {
    parameter: Parameter[]
    trigger: string
    action: {
        function_name: string
    }
    payload: any
    messageType: string
    triggerType: TriggerType
}

// interface Selection {
//     type?: string
//     description?: string
//     cborHex?: string
// }

// interface Proposal {
//     deposit?: any
//     refundAccount?: {
//         network?: any
//         credential?: {
//             'key hash'?: any
//         }
//     }
//     anchor?: {
//         url: any
//         dataHash: any
//     }
//     newconstitution?: {
//         url: any
//         dataHash: any
//     }
// }

// interface RequestBody {
//     selections: (string | Selection)[]
//     proposals?: Proposal[]
//     outputs?: {
//         address: string
//         value: string
//     }[]
//     certificates?: {
//         type: string
//         key: string
//         drep: any
//     }[]
//     vote?: {
//         voter: string
//         role: string
//         proposal: any
//         vote: boolean
//         anchor: {
//             url: any
//             dataHash: any
//         }
//     }[]
// }

export const handleTransaction = async (message: any, agentId: string): Promise<void> => {
    if (message != 'Ping' || message == 'proposal') {
        // Parse the JSON string into a JavaScript object
        const data: FunctionData = JSON.parse(message)

        if (data.messageType == 'action') {
            if (data.trigger == 'true') {
                const kuberUrl = kuberBaseUrl + data.payload.url
                const options = data.payload.options
                options.headers['api-key'] = kuberApiKey
                try {
                    const response = await fetch(kuberUrl, options)
                    if (!response.ok) {
                        console.log('failed reques', options)
                        const responseBody = await response.text()
                        let responseJson
                        try {
                            responseJson = JSON.parse(responseBody)
                        } catch (err) {
                            responseJson = JSON.parse(JSON.stringify(responseBody))
                        }
                        throw new Error(
                            `${data.action.function_name} failed ${response.status}.\n ${JSON.stringify(responseJson, undefined, 4)}`
                        )
                    }
                    const kuberData = await response.json()
                    console.log(`Kuber Response:  ${data.action.function_name}`, kuberData)
                    await saveTriggerHistory(
                        agentId,
                        data.action.function_name,
                        true,
                        true,
                        `Successful Creation of transaction of ${data.action.function_name}`,
                        data.triggerType,
                        kuberData.hash
                    )
                } catch (error: any) {
                    console.error('Error submitting transaction:', error.message)
                    console.log('failed request:', options.body)
                    await saveTriggerHistory(
                        agentId,
                        data.action.function_name,
                        true,
                        false,
                        error.message,
                        data.triggerType,
                        ''
                    )
                }
            } else {
                await saveTriggerHistory(agentId, data.action.function_name, false, false, '', 'CRON', '')
            }
        }
    }
}

interface SigningKey {
    type: string
    description: string
    cborHex: string
}

interface Anchor {
    url: string
    dataHash: string
}

interface Certificate {
    type: string
    key: string
    anchor: Anchor
}

interface RequestBody {
    selections: Array<string | SigningKey>
    certificates: Certificate[]
}

const runCheckUntil400 = async (
    kuberUrl: string,
    apiUrl: any,
    agent_id: string,
    api_key: string
) => {
    const addressApiUrl = `${apiUrl}/api/agent/${agent_id}/keys`

    try {
        const addressResponse = await fetch(addressApiUrl)
        if (!addressResponse.ok) {
            throw new Error(
                `Error fetching address data: ${addressResponse.statusText}`
            )
        }

        const addressData = await addressResponse.json()
        const agentAddress = addressData.agent_address
        const payment_cborHex = addressData.payment_signing_key
        const stake_cborHex = addressData.stake_signing_key
        const ownerKeyHash = addressData.drep_id

        const requestBody: RequestBody = {
            selections: [
                agentAddress,
                {
                    type: 'PaymentSigningKeyShelley_ed25519',
                    description: 'Payment Signing Key',
                    cborHex: payment_cborHex,
                },
                {
                    type: 'PaymentSigningKeyShelley_ed25519',
                    description: 'Stake Signing Key',
                    cborHex: stake_cborHex,
                },
            ],
            certificates: [
                {
                    type: 'registerdrep',
                    key: ownerKeyHash,
                    anchor: {
                        url: 'https://bit.ly/3zCH2HL',
                        dataHash:
                            '1111111111111111111111111111111111111111111111111111111111111111',
                    },
                },
            ],
        }

        const response = await fetch(`${kuberUrl}/api/v1/tx?submit=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': api_key,
            },
            body: JSON.stringify(requestBody),
        })

        const contentType = response.headers.get('Content-Type')

        if (response.ok) {
            if (contentType && contentType.includes('application/json')) {
                const responseData = await response.json()
                console.log('Response:', responseData)
                return { status: response.status, data: responseData }
            } else {
                const textData = await response.text()
                console.log('Response:', textData)
                return { status: response.status, data: { message: textData } }
            }
        } else if (response.status === 400) {
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json()

                if (
                    errorData.message &&
                    errorData.message.includes('ConwayDRepAlreadyRegistered')
                ) {
                    console.log('error message')
                    return {
                        status: 400,
                        data: { registered: true, balance: true },
                    }
                }
                return { status: 400, data: errorData }
            } else {
                const textData = await response.text()
                console.error('Bad Request Error:', textData)
                return { status: 400, data: { message: textData } }
            }
        } else if (response.status === 200) {
            await new Promise((resolve) => setTimeout(resolve, 15000))
            const textData = await response.text()
            return { status: 200, data: { message: textData } }
        } else {
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json()
                console.error('Error submitting transaction:', errorData)
                return { status: response.status, data: errorData }
            } else {
                const textData = await response.text()
                console.error('Error submitting transaction:', textData)
                return { status: response.status, data: { message: textData } }
            }
        }
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export const checkDrepStatus = async (
    kuberUrl: string,
    apiUrl: any,
    agent_id: string,
    api_key: string
) => {
    let status = 401 // Initial status to start the loop
    while (status !== 400) {
        const result = await runCheckUntil400(
            kuberUrl,
            apiUrl,
            agent_id,
            api_key
        )
        status = result.status
        if (status === 400 && result.data.registered) {
            console.log('Registered:', result.data)
            return { registered: true }
        }
    }
}

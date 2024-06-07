interface SigningKey {
    type: string
    description: string
    cborHex: string
}

interface Certificate {
    type: string
    key: string
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
        const stake_vkey_hash = addressData.stake_verification_key_hash

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
                    key: stake_vkey_hash,
                    type: 'registerstake',
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
        } else {
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json()
                console.error('Error:', errorData)
                return { status: response.status, data: errorData }
            } else {
                const textData = await response.text()
                console.error('Error:', textData)
                return { status: response.status, data: { message: textData } }
            }
        }
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export const checkStakeReg = async (
    kuberUrl: string,
    apiUrl: any,
    agent_id: string,
    api_key: string
) => {
    let status = 200 // Initial status to start the loop
    while (status !== 400) {
        const result = await runCheckUntil400(
            kuberUrl,
            apiUrl,
            agent_id,
            api_key
        )
        status = result.status
        if (status === 200) {
            // Pause execution for 15 seconds
            await new Promise((resolve) => setTimeout(resolve, 15000))
        }
        if (
            status === 400 &&
            result.data.message &&
            result.data.message.includes('StakeKeyRegisteredDELEG')
        ) {
            console.log('Stake key registered:', result.data)
            return { registered: true }
        }
    }
}

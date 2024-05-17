import axios from 'axios';

const kuberBaseUrl = 'https://sanchonet.kuber.cardanoapi.io';
const kuberApiKey = 'bS6Nm7dJTnCtk0wqwJChwZ7Wot2RTvDS7dETmYYHJ8htqrMs3xYI5njFeGUbno';


interface Parameter {
    name: string;
    value: string;
}

interface FunctionData {
    parameter: Parameter[];
    function_name: string;
}
interface Selection {
    type?: string;
    description?: string;
    cborHex?: string;
}

interface Proposal {
    deposit: number;
    refundAccount: string;
    anchor: {
        url: any;
        dataHash: any;
    };
    newconstitution: {
        url: any;
        dataHash: any;
    };
}

interface RequestBody {
    selections: (string | Selection)[];
    proposals: Proposal[];
}

export const handleTransaction = async (message: any, agentId: string): Promise<void> => {
    if(message!='Ping')
    {
        // Parse the JSON string into a JavaScript object
        const data: FunctionData = JSON.parse(message);

        // Function to get the value of a parameter by its name
        function getParameterValue(name: string): string | undefined {
            const param = data.parameter.find(param => param.name === name);
            return param ? param.value : undefined;
        }


        if (data.function_name == 'Proposal New Constitution')
        {
              const addressApiUrl = `http://127.0.0.1:8000/api/agent/${agentId}/keys`;
        const addressResponse = await axios.get(addressApiUrl);
    const kuberUrl = `${kuberBaseUrl}/api/v1/tx?submit=false`;

   const address = 'addr_test1qrd3hs7rlxwwdzthe6hj026dmyt3y0heuulctscyydh2kguh4xfmpjqkd25vfq69hcvj27jqyk4hvnyxu7vma2c4kvps8eh2m3'

    const body: RequestBody = {
        selections: [
            addressResponse.data.agent_address,
            {
                type: "PaymentSigningKeyShelley_ed25519",
                description: "Payment Signing Key",
                cborHex: "5820ab863c2e6c2e0837d1929b872c43dbe485c326a29527bf267da4cde498731f02"

            }
        ],
        proposals: [
            {
                deposit: 100,
                refundAccount: "stake_test1urd3hs7rlxwwdzthe6hj026dmyt3y0heuulctscyydh2kgck6nkmz",
                anchor: {
                    url: getParameterValue('anchor_url'),
                    dataHash: getParameterValue('anchor_dataHash')
                },
                newconstitution: {
                    url: getParameterValue('newConstitution_url'),
                    dataHash: getParameterValue('newConstitution_dataHash')
                }
            }
        ]
    };

     try {
        const response = await fetch(kuberUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': `${kuberApiKey}`
            },
            body: JSON.stringify(body),

        })
       if (!response.ok) {
            throw new Error(`Kuber API request failed with status ${response.status}`);
        }
        const kuberData = await response.json();
        console.log('Kuber Response:', kuberData);
    } catch (error) {
        console.error('Error submitting transaction:', error)
    }
}
        }

};

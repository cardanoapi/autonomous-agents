import axios from 'axios';
import {saveTriggerHistory} from "../repository/trigger_history_repository";
import {createOrUpdateFunctionDetail} from "../repository/fucntion_details_repository";

const kuberBaseUrl = 'https://sanchonet.kuber.cardanoapi.io';
const kuberApiKey = 'bS6Nm7dJTnCtk0wqwJChwZ7Wot2RTvDS7dETmYYHJ8htqrMs3xYI5njFeGUbno';
const ApiUrl = 'http://manager.agents.cardanoapi.io/'
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
    proposals?: Proposal[];
    outputs?: {
        address: string;
        value: string;
    }[];
}

const agentFunctionMap: { [agentId: string]: Set<string> } = {};

export const handleTransaction = async (message: any, agentId: string): Promise<void> => {
    if (message != 'Ping') {
        // Parse the JSON string into a JavaScript object
        const data: FunctionData = JSON.parse(message);
        // Function to get the value of a parameter by its name
        function getParameterValue(name: string): string | undefined {
            const param = data.parameter.find(param => param.name === name);
            return param ? param.value : undefined;
        }

        if (!agentFunctionMap[agentId]) {
          agentFunctionMap[agentId] = new Set();
        }
        agentFunctionMap[agentId].add(data.function_name);

        if (data.function_name == 'Proposal New Constitution') {
        await createOrUpdateFunctionDetail("Proposal New Constitution", true);
        const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`;
        const addressResponse = await axios.get(addressApiUrl);
        const agentAddress = addressResponse.data.agent_address;
            const kuberUrl = `${kuberBaseUrl}/api/v1/tx?submit=false`;

            const body: RequestBody = {
                selections: [
                    agentAddress,
                    {
                        type: "PaymentSigningKeyShelley_ed25519",
                        description: "Payment Signing Key",
                        cborHex: "5820ab863c2e6c2e0837d1929b872c43dbe485c326a29527bf267da4cde498731f02"
                    }
                ],
                proposals: [
                    {
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
                        'Api-Key': kuberApiKey
                    },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    const responseBody = await response.text(); // Get the response body as text
                    throw new Error(`Proposal New Constitution Transaction failed : ${response.status}. ${responseBody}`);
                }
                const kuberData = await response.json();
                console.log('Kuber Response:', kuberData);
                 await saveTriggerHistory(agentId, data.function_name, true, true, "Successful Creation of transaction of New Constitution Proposal");
            } catch (error: any) {
                console.error('Error submitting transaction:', error.message);
                await saveTriggerHistory(agentId, data.function_name, true, false,error.message);
            }

        } else if (data.function_name == 'SendAda Token') {
            await createOrUpdateFunctionDetail("SendAda Token", true);
            const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`;
            const addressResponse = await axios.get(addressApiUrl);
            const agentAddress = addressResponse.data.agent_address;
            const requestBody: RequestBody = {
                selections: [agentAddress],
                outputs: [
                    {
                        address: getParameterValue('Receiver Address')!,
                        value: "10A"
                    }
                ]
            };

            const headers = {
                'Content-Type': 'application/json',
                'api-key': kuberApiKey
            };

            try {
                const response = await fetch('https://preprod.kuber.cardanoapi.io/api/v1/tx', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestBody)
                });

                 if (!response.ok) {
                    const responseBody = await response.text(); // Get the response body as text
                    throw new Error(`SendAda Token Transaction failed ${response.status}. ${responseBody}`);
                }
                const kuberData = await response.json();
                console.log('Kuber Response:', kuberData);
                   await saveTriggerHistory(agentId, data.function_name, true, true,"Successful Creation of transaction of Send Ada Transaction");
            } catch (error: any) {
                console.error('Error submitting transaction:', error.message);
                   await saveTriggerHistory(agentId, data.function_name, true, false,error.message);
            }
        }
    }
};

export const stopFunctionsWhenAgentDisconnects = async (agentId: string) => {
  const functions = agentFunctionMap[agentId];
  if (functions) {
    for (const functionName of functions) {
      await createOrUpdateFunctionDetail(functionName, false);
    }
    delete agentFunctionMap[agentId];
  }
};
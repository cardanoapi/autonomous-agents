"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopFunctionsWhenAgentDisconnects = exports.handleTransaction = void 0;
const axios_1 = __importDefault(require("axios"));
const trigger_history_repository_1 = require("../repository/trigger_history_repository");
const fucntion_details_repository_1 = require("../repository/fucntion_details_repository");
const delegateRep_1 = require("../helper/delegateRep");
const stakeReg_1 = require("../helper/stakeReg");
const kuberBaseUrl = 'https://kuber-govtool.cardanoapi.io';
const kuberApiKey = 'bS6Nm7dJTnCtk0wqwJChwZ7Wot2RTvDS7dETmYYHJ8htqrMs3xYI5njFeGUbno';
const ApiUrl = process.env.API_SERVER;
const agentFunctionMap = {};
const handleTransaction = async (message, agentId) => {
    if (message != 'Ping' || message == 'proposal') {
        // Parse the JSON string into a JavaScript object
        const data = JSON.parse(message);
        // Function to get the value of a parameter by its name
        function getParameterValue(name) {
            const param = data.parameter.find(param => param.name === name);
            return param ? param.value : undefined;
        }
        if (!agentFunctionMap[agentId]) {
            agentFunctionMap[agentId] = new Set();
        }
        agentFunctionMap[agentId].add(data.function_name);
        data.function_name == 'kuber/api/tx/build';
        if (data.function_name == 'Proposal New Constitution') {
            if (data.trigInfo == "true") {
                await (0, fucntion_details_repository_1.createOrUpdateFunctionDetail)("Proposal New Constitution", true);
                const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`;
                const addressResponse = await axios_1.default.get(addressApiUrl);
                const agentAddress = addressResponse.data.agent_address;
                const agentCborhex = addressResponse.data.payment_signing_key;
                const kuberUrl = `${kuberBaseUrl}/api/v1/tx?submit=true`;
                const body = {
                    selections: [
                        agentAddress,
                        {
                            type: "PaymentSigningKeyShelley_ed25519",
                            description: "Payment Signing Key",
                            cborHex: agentCborhex
                        }
                    ],
                    proposals: [
                        {
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
                    await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, true, "Successful Creation of transaction of New Constitution Proposal");
                }
                catch (error) {
                    console.error('Error submitting transaction:', error.message);
                    await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, false, error.message);
                }
            }
            else {
                await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, false, false, "");
            }
        }
        else if (data.function_name == 'SendAda Token') {
            if (data.trigInfo == "true") {
                await (0, fucntion_details_repository_1.createOrUpdateFunctionDetail)("SendAda Token", true);
                const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`;
                const addressResponse = await axios_1.default.get(addressApiUrl);
                const agentAddress = addressResponse.data.agent_address;
                const agentCborhex = addressResponse.data.payment_signing_key;
                const requestBody = {
                    selections: [
                        agentAddress,
                        {
                            type: "PaymentSigningKeyShelley_ed25519",
                            description: "Payment Signing Key",
                            cborHex: agentCborhex
                        }
                    ],
                    outputs: [
                        {
                            address: getParameterValue('Receiver Address'),
                            value: "10A"
                        }
                    ]
                };
                const headers = {
                    'Content-Type': 'application/json',
                    'api-key': kuberApiKey
                };
                const kuberUrlSendAda = `${kuberBaseUrl}/api/v1/tx?submit=true`;
                try {
                    const response = await fetch(kuberUrlSendAda, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody)
                    });
                    if (!response.ok) {
                        const responseBody = await response.text(); // Get the response body as text
                        throw new Error(`SendAda Token Transaction failed ${response.status}. ${responseBody}`);
                    }
                    const kuberData = await response.json();
                    console.log('Kuber Response Send Ada Token:', kuberData);
                    await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, true, "Successful Creation of transaction of Send Ada Transaction");
                }
                catch (error) {
                    console.error('Error submitting transaction:', error.message);
                    await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, false, error.message);
                }
            }
            else {
                await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, false, false, "");
            }
        }
        else if (data.function_name == 'Delegation') {
            const status = await (0, stakeReg_1.checkStakeReg)(kuberBaseUrl, ApiUrl, agentId, kuberApiKey);
            if (await status) {
                await (0, fucntion_details_repository_1.createOrUpdateFunctionDetail)("Delegation", true);
                const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`;
                const addressResponse = await axios_1.default.get(addressApiUrl);
                const agentAddress = addressResponse.data.agent_address;
                const paymentCborHex = addressResponse.data.payment_signing_key;
                const stakeCborHex = addressResponse.data.stake_signing_key;
                const ownerKeyHash = addressResponse.data.stake_verification_key_hash;
                const requestBody = {
                    selections: [
                        agentAddress,
                        {
                            type: "PaymentSigningKeyShelley_ed25519",
                            description: "Payment Signing Key",
                            cborHex: paymentCborHex
                        },
                        {
                            type: "PaymentSigningKeyShelley_ed25519",
                            description: "Payment Signing Key",
                            cborHex: stakeCborHex
                        }
                    ],
                    certificates: [
                        {
                            type: "delegate",
                            key: ownerKeyHash,
                            drep: getParameterValue('drep')
                        }
                    ]
                };
                const headers = {
                    'Content-Type': 'application/json',
                    'api-key': kuberApiKey
                };
                const kuberUrlDelegation = `${kuberBaseUrl}/api/v1/tx?submit=true`;
                try {
                    const response = await fetch(kuberUrlDelegation, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody)
                    });
                    if (!response.ok) {
                        const responseBody = await response.text(); // Get the response body as text
                        throw new Error(`Proposal delegation Token Transaction failed ${response.status}. ${responseBody}`);
                    }
                    const kuberData = await response.json();
                    console.log('Kuber Response proposal delegation :', kuberData);
                    await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, true, "Successful Creation of Delegation of Proposal");
                }
                catch (error) {
                    console.error('Error submitting transaction:', error.message);
                    await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, false, error.message);
                }
            }
            else {
                await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, false, false, "");
            }
        }
        else if (data.function_name == 'Vote') {
            console.log('inside vote function');
            if (data.trigInfo == "true") {
                const status = await (0, delegateRep_1.checkDrepStatus)(kuberBaseUrl, ApiUrl, agentId, kuberApiKey);
                if (await status) {
                    await (0, fucntion_details_repository_1.createOrUpdateFunctionDetail)("Vote", true);
                    const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`;
                    const addressResponse = await axios_1.default.get(addressApiUrl);
                    const agentAddress = addressResponse.data.agent_address;
                    const paymentCborHex = addressResponse.data.payment_signing_key;
                    const stakeCborHex = addressResponse.data.stake_signing_key;
                    const ownerKeyHash = addressResponse.data.drep_id;
                    const requestBody = {
                        selections: [
                            agentAddress,
                            {
                                type: "PaymentSigningKeyShelley_ed25519",
                                description: "Payment Signing Key",
                                cborHex: paymentCborHex
                            },
                            {
                                type: "PaymentSigningKeyShelley_ed25519",
                                description: "Payment Signing Key",
                                cborHex: stakeCborHex
                            }
                        ],
                        vote: [
                            {
                                voter: ownerKeyHash,
                                role: "drep",
                                proposal: getParameterValue('proposal'),
                                vote: true,
                                anchor: {
                                    "url": "https://bit.ly/3zCH2HL",
                                    "dataHash": "1111111111111111111111111111111111111111111111111111111111111111"
                                }
                            }
                        ]
                    };
                    const headers = {
                        'Content-Type': 'application/json',
                        'api-key': kuberApiKey
                    };
                    const kuberUrlDelegation = `${kuberBaseUrl}/api/v1/tx?submit=true`;
                    try {
                        const response = await fetch(kuberUrlDelegation, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(requestBody)
                        });
                        if (!response.ok) {
                            const responseBody = await response.text(); // Get the response body as text
                            throw new Error(`Voting transaction failed ${response.status}. ${responseBody}`);
                        }
                        const kuberData = await response.json();
                        console.log('Kuber Vote Response:', kuberData);
                        await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, true, "Successful vote");
                    }
                    catch (error) {
                        console.error('Error submitting transaction:', error.message);
                        await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, false, error.message);
                    }
                }
                else {
                    console.log("waiting.........");
                }
            }
            else {
                await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, false, false, "");
            }
        }
        else if (data.function_name == 'Info Action Proposal') {
            if (data.trigInfo == "true") {
                await (0, fucntion_details_repository_1.createOrUpdateFunctionDetail)("Info Action Proposal", true);
                const addressApiUrl = `${ApiUrl}/api/agent/${agentId}/keys`;
                const addressResponse = await axios_1.default.get(addressApiUrl);
                const agentAddress = addressResponse.data.agent_address;
                const agentCborhex = addressResponse.data.agent_private_key;
                const ownerKeyHash = addressResponse.data.agent_key_hash;
                const requestBody = {
                    selections: [
                        agentAddress,
                        {
                            type: "PaymentSigningKeyShelley_ed25519",
                            description: "Payment Signing Key",
                            cborHex: agentCborhex
                        }
                    ],
                    proposals: [
                        {
                            deposit: "100A",
                            refundAccount: {
                                network: "Testnet",
                                credential: {
                                    "key hash": ownerKeyHash
                                }
                            },
                            anchor: {
                                url: getParameterValue('anchor_url'),
                                dataHash: getParameterValue('anchor_datahash')
                            }
                        }
                    ]
                };
                const headers = {
                    'Content-Type': 'application/json',
                    'api-key': kuberApiKey
                };
                const kuberUrlDelegation = `${kuberBaseUrl}/api/v1/tx?submit=true`;
                try {
                    const response = await fetch(kuberUrlDelegation, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(requestBody)
                    });
                    if (!response.ok) {
                        const responseBody = await response.text(); // Get the response body as text
                        throw new Error(`Info proposal Transaction failed ${response.status}. ${responseBody}`);
                    }
                    const kuberData = await response.json();
                    console.log('Kuber Response:', kuberData);
                    await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, true, "Successful Creation of Info Action Proposal");
                }
                catch (error) {
                    console.error('Error submitting transaction:', error.message);
                    await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, true, false, error.message);
                }
            }
            else {
                await (0, trigger_history_repository_1.saveTriggerHistory)(agentId, data.function_name, false, false, "");
            }
        }
    }
};
exports.handleTransaction = handleTransaction;
const stopFunctionsWhenAgentDisconnects = async (agentId) => {
    const functions = agentFunctionMap[agentId];
    if (functions) {
        for (const functionName of functions) {
            await (0, fucntion_details_repository_1.createOrUpdateFunctionDetail)(functionName, false);
        }
        delete agentFunctionMap[agentId];
    }
};
exports.stopFunctionsWhenAgentDisconnects = stopFunctionsWhenAgentDisconnects;

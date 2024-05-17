
// Function to handle proposal new constitution
import {sendParamsToWebSocket} from "./index";

export function TransactionKuber(action:any) {
    // Log message for debugging
    console.log('Executing Proposal New Constitution function.');

    // Call the WebSocket message sending function with parameters
    sendParamsToWebSocket(JSON.stringify(action))
}

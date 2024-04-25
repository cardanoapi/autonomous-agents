import {WebSocket} from "ws";
import {fetchAgentConfiguration} from "../repository/agent_manager_repository";


class WebSocketConnectionManager {
    activeConnections: { [key: string]: WebSocket } = {};
    async connectWebSocket(websocketAgentId: string, websocket: WebSocket): Promise<void> {
        this.activeConnections[websocketAgentId] = websocket;
    }

    async disconnectWebSocket(websocketAgentId: string): Promise<void> {
        // Disconnect WebSocket connection of agent
        const existingWebSocket = this.activeConnections[websocketAgentId];
        if (existingWebSocket) {
            delete this.activeConnections[websocketAgentId];
            await existingWebSocket.close(1000, 'Connection closed');
        }
    }

        async sendToWebSocket(websocketAgentId: string, message: any): Promise<void> {
        // Send message to WebSocket connection of agent
        const agent_active = await this.checkIfAgentActive(websocketAgentId)
        if (agent_active) {
            const websocket = this.activeConnections[websocketAgentId];
            if (websocket) {
                try {
                    if (message.message === 'config_updated') {
                        // Fetch updated configuration
                        const {instanceCount, configurations} = await fetchAgentConfiguration(websocketAgentId);
                        const updatedMessage = {
                            message: 'config_updated',
                            instance_count: Number(instanceCount),
                            configurations,
                        };
                        await websocket.send(JSON.stringify(updatedMessage));
                    } else {
                        await websocket.send(JSON.stringify(message));
                    }
                } catch (error) {
                    console.log(`Error sending message to agent ${websocketAgentId}: ${error}`);
                }
            } else {
                console.log((`Agent ${websocketAgentId} is not connected`));
            }
        }
    }

    async checkIfAgentActive(websocketAgentId: string): Promise<boolean> {
        // Check if agent is active
        return !!this.activeConnections[websocketAgentId];
    }

    async removePreviousAgentConnectionIfExists(websocketAgentId: string): Promise<void> {
        // Remove previous WebSocket connection of agent if exists
        const existingWebSocket = this.activeConnections[websocketAgentId];
        if (existingWebSocket) {
            delete this.activeConnections[websocketAgentId];
            await existingWebSocket.close(1000, 'Establishing a new connection');
        }
    }


}

const manager = new WebSocketConnectionManager();
export default manager;

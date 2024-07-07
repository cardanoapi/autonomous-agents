import {IncomingMessage} from "http";
import {checkIfAgentExistsInDB, fetchAgentConfiguration} from "../repository/agent_manager_repository";
import {WsRpcServer} from "../lib/WsRpcServer";
import {RpcV1} from "libcardano/network/Rpc";
export class AgentManagerRPC extends WsRpcServer{
    protected handleMethodCall(connection_id: string, method: string, args: any[]): any|undefined {
        console.log("Method call from  client",connection_id,method,args)

        return args
    }

    protected async validateConnection(req:IncomingMessage): Promise<string> {
        const agentId = req.url?.slice(1)
        console.log("new connection from",req.socket.remoteAddress)

        if(agentId){
            let exists = await checkIfAgentExistsInDB(agentId)
            if(exists){
                return agentId
            }else{
                throw  Error("Agent is not found "+agentId)
            }
        }else{
            throw  Error("Invalid websocket connection")
        }

    }

    protected validateEventBroadcast(connection_id: string, topic: string, message: any): Promise<boolean> {
        // TODO: handle the event emitted
        console.log("Event from client",connection_id,topic,message)
        // we don't forward this event to other connections.
        return Promise.resolve(false);
    }

    protected onReady(client: RpcV1): void {
        client.fireMethod('challenge',300)
        fetchAgentConfiguration(client.getId()).then((config)=>{
          client.emit('config',config)
        })
    }

}
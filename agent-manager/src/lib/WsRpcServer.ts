import {RawData, Server, WebSocket} from 'ws'
import { IncomingMessage} from "http";
import { RpcV1 } from 'libcardano/network/Rpc';
import {RpcV1Server} from "libcardano/network/WsRpcServer";
import {Pipe} from "libcardano/network/event";
import {CborDuplex} from "libcardano/network/ouroboros";

export class WsClientPipe extends  Pipe<any,any> {
    ws: WebSocket

    constructor(ws: WebSocket) {
        super()
        this.ws = ws
        ws.on('message', (message: RawData) => {
            this.emit('data', message)
        })
        ws.on('close',  (...args) => {
            this.emit('close',...args)
        })
    }

    write(chunk: any, cb?: ((error?: Error | undefined) => void) | undefined): boolean {
        this.ws.send(chunk, {binary: true}, cb,)
        return true
    }

    terminate(code: number, message: string) {
        this.ws.close(code, message)

    }
}
export abstract class WsRpcServer extends RpcV1Server{
    server:Server
    timeout=30000

    constructor(server:Server) {
        super()
        this.server=server
        this.setupServer()
    }

    private setupServer(){
        this.server.on('connection', async  (ws:WebSocket, req)=> {
            let conn_id=await this.validateConnection(req)
            ws.on('message',(msg)=>{
                console.log("Wsmessage ",conn_id,msg.toString('hex'))
            })
            if(this.activeConnections[conn_id]){
                ws.close(1000,
                    `Connection for id ${conn_id} is already active`
                    )
                return;
            }
            this.addConnection(conn_id,new CborDuplex(new WsClientPipe(ws)))
            this.onReady(this.activeConnections[conn_id])

        })
    }

    protected abstract  validateConnection(http:IncomingMessage):Promise<string>;
    protected abstract  onReady(client:RpcV1):void

}

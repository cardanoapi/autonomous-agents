import { RawData, Server, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { RpcV1 } from 'libcardano/network/Rpc'
import { RpcV1Server } from 'libcardano/network/WsRpcServer'
import { Pipe } from 'libcardano/network/event'
import { CborDuplex } from 'libcardano/network/ouroboros'
import { cborxBackend } from 'libcardano/lib/cbor'

export class WsClientPipe extends Pipe<any, any> {
    ws: WebSocket

    constructor(ws: WebSocket) {
        super()
        this.ws = ws
        ws.on('message', (message: RawData) => {
            this.emit('data', message)
        })
        ws.on('close', (...args) => {
            this.emit('close', ...args)
        })
    }

    write(chunk: any, cb?: ((error?: Error | undefined) => void) | undefined): boolean {
        this.ws.send(chunk, { binary: true }, cb)
        return true
    }

    terminate(code: number, message: string) {
        this.ws.close(code, message)
    }
}
export abstract class WsRpcServer extends RpcV1Server {
    server: Server
    timeout = 30000

    constructor(server: Server) {
        super()
        this.server = server
        this.setupServer()
    }

    protected abstract validateConnection(http: IncomingMessage): Promise<string>

    protected abstract onReady(client: RpcV1): void

    private setupServer() {
        this.server.on('connection', async (ws: WebSocket, req) => {
            let validatedConnId
            try {
                validatedConnId = await this.validateConnection(req)
                if (this.activeConnections[validatedConnId]) {
                    ws.close(1000, `Connection for id ${validatedConnId} is already active`)
                    return
                }
                this.addConnection(validatedConnId, new CborDuplex(new WsClientPipe(ws), cborxBackend(true)))
                this.onReady(this.activeConnections[validatedConnId])
            } catch (err: any) {
                console.error('New Agent connection error', err)
                if (validatedConnId) this.disconnect(validatedConnId, err.message)
                else {
                    ws.close(1000, err.message)
                }
            }
        })
    }
}

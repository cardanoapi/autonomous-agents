import { Pipe } from 'libcardano/network/event'
import WebSocket, { RawData } from 'ws'

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
        ws.on('error', (...args: any) => {
            this.emit('error', ...args)
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

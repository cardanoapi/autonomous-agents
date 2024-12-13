import {RpcV1} from 'libcardano/network/Rpc'
import {ILog} from './TriggerActionHandler'

export class ManagerInterface {
    rpc: RpcV1

    constructor(rpc: RpcV1) {
        this.rpc = rpc
    }

    buildTx(tx: any, submit: boolean): Promise<any> {
        return this.rpc.callMethod('buildTx', tx, submit)
    }

    submitTx(tx: any) {
        return this.rpc.callMethod('submitTx', tx)
    }

    logTx(log_data: ILog): void {
        return this.rpc.fireMethod('logEvent', log_data)
    }

    loadFunds(address: string, txAmt: number): Promise<any> {
        return this.rpc.callMethod('loadFunds', address, txAmt)
    }

    getFaucetBalance(address: string): Promise<any> {
        return this.rpc.callMethod('getFaucetBalance', address)
    }

    saveMetadata(content: string): Promise<any> {
        return this.rpc.callMethod('saveMetadata', content)
    }

    checkAndSaveDrepRegistration(drepId: string) {
        this.rpc.fireMethod('checkAndSaveDrepRegistration', drepId)
    }

    fetchMetadata(url: string, hash: string): Promise<any> {
        return this.rpc.callMethod('fetchMetadata', url, hash)
    }
}

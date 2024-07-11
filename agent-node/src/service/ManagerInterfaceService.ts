import { RpcV1 } from 'libcardano/network/Rpc'
import { ILog } from './TriggerActionHandler'

export class ManagerInterface {
    private static managerInterface: ManagerInterface
    rpc: RpcV1

    constructor(rpc: RpcV1) {
        this.rpc = rpc
    }

    public static setInstance(rpc: RpcV1) {
        ManagerInterface.managerInterface = new ManagerInterface(rpc)
    }

    public static getInstance(): ManagerInterface | null {
        return ManagerInterface.managerInterface
            ? ManagerInterface.managerInterface
            : null
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
}

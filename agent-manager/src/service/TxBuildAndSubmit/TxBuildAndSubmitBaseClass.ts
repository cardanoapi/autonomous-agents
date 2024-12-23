export class TxBuildAndSubmitBaseClass {
    async buildAndSubmitTx(txSpec: any): Promise<any> {
        throw new Error(`Method buildAndSubmitTx with parameter ${txSpec} must be implemented`)
    }
}

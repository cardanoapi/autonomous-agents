import {kuber, KuberType} from "./KuberService";
import { Blockfrost, BlockFrostType} from "./BlockFrostService";
import environments from "../../config/environments";

export type TxSubmitterType = 'Kuber' | 'Blockfrost'

let txSubmitterService: TxSubmitterService

function getTxSubmitter(txSubmitterType: TxSubmitterType) {
    console.log('TxSubmitterType : ',txSubmitterType)
    switch (txSubmitterType) {
        case 'Kuber':
            return kuber;
        case 'Blockfrost':
            return new Blockfrost()
    }
}

export class TxSubmitterService {

    submitter: KuberType | BlockFrostType

    constructor(txSubmitterType: TxSubmitterType) {
        this.submitter = getTxSubmitter(txSubmitterType)
    }

    async buildAndSubmitTx(txSpec: any) {
        // eslint-disable-next-line no-useless-catch
        try {
            return await this.submitter.buildAndSubmitTx(txSpec)
        } catch (err) {
            throw err
        }
    }
}

if (environments.enableBlockFrostSubmitApi) {
    txSubmitterService = new TxSubmitterService('Blockfrost')
} else {
    txSubmitterService = new TxSubmitterService('Kuber')
}

export const txSubmitter = txSubmitterService

export type TxSubmitterServiceType = TxSubmitterService

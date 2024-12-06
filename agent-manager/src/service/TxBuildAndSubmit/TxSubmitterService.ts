import {kuber, KuberType} from "./KuberService";
import {Blockfrost, BlockFrostType} from "./BlockFrostService";
import environments from "../../config/environments";

export type TxSubmitterType = 'Kuber' | 'Blockfrost'

let txSubmitterService: TxSubmitterService

function fetchTxBuilder(txBuilderType: TxSubmitterType) {
    console.log("Submit API : ", txBuilderType)
    switch (txBuilderType) {
        case 'Kuber':
            return kuber;
        case 'Blockfrost':
            return new Blockfrost()
    }
}

export class TxSubmitterService {

    submitter: KuberType | BlockFrostType

    constructor(txBuilderType: TxSubmitterType) {
        this.submitter = fetchTxBuilder(txBuilderType)
    }

     async buildAndSubmitTx(txSpec: any) {
        return this.submitter.buildAndSubmitTx(txSpec)
    }
}

if (environments.enableBlockFrostSubmitApi) {
    txSubmitterService = new TxSubmitterService('Blockfrost')
} else {
    txSubmitterService = new TxSubmitterService('Kuber')
}

export const txSubmitter = txSubmitterService

export type TxSubmitterServiceType = TxSubmitterService


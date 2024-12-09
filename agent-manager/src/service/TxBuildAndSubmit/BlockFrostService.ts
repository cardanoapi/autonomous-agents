import environments from "../../config/environments";
import {kuber} from "./KuberService";
import {TxBuildAndSubmitBaseClass} from "./TxBuildAndSubmitBaseClass";

export class Blockfrost extends TxBuildAndSubmitBaseClass {
    constructor() {
        super();
        if (!environments.blockFrostApiKey ) {
            throw new Error('BlockFrost API key not provided')
        }
    }

    async blockfrostSubmitTransaction(cborSignedTx: Buffer) {
        const url = `https://cardano-${environments.networkName}.blockfrost.io/api/v0/tx/submit`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/cbor",
                project_id: environments.blockFrostApiKey,
            },
            body: cborSignedTx,
        });
        if (res.status === 200) {
            return res.json();
        } else {
            return res.text().then((txt) => {
                let err: any;
                let json: any;
                try {
                    json = JSON.parse(txt);
                    if (json) {
                        err = Error(
                            `BlockFrost [Status ${res.status}] : ${
                                json.message ? json.message : txt
                            }`
                        );
                    } else {
                        err = Error(`BlockFrost [Status ${res.status}] : ${txt}`);
                    }
                } catch (e) {
                    err = Error(`BlockFrost [Status ${res.status}] : ${txt}`);
                }
                err.status = res.status;
                throw err;
            });
        }
    }

    async buildAndSubmitTx(txSpec: any) {
        try {
            const response = await kuber.buildTx(txSpec)
            const cborSignedTx = Buffer.from(response.cborHex, "hex");
            const hash = await this.blockfrostSubmitTransaction(cborSignedTx);
            return {
                hash: hash,
                cborHex: response.cborHex,
                Type: "Witnessed Tx ConwayEra",
                Description: "Ledger Cddl Format"
            }
        } catch (err: any) {
            throw new Error('BlockFrostError: ' + err.message)
        }
    }
}

export type BlockFrostType = Blockfrost





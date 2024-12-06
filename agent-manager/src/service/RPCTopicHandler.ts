import {ManagerWalletService} from "./Manager/ManagerWallet";
import {txSubmitter} from "./TxBuildAndSubmit/TxSubmitterService";
import {kuber} from "./TxBuildAndSubmit/KuberService";
import {saveTriggerHistory, updateAgentDrepRegistration} from "../repository/trigger_history_repository";
import {ILog} from "./Manager/AgentManagerRPC";
import {metaDataService} from "./MetadataService";
import {dbSync} from "./DbSyncService";

export class RPCTopicHandler {
    managerWallet

    constructor(managerWallet: ManagerWalletService) {
        this.managerWallet = managerWallet
    }

    handleEvent(
        eventName: string,
        connection_id: string,
        args: any,
    ) {
        const handler = (this as any)[eventName]
        if (handler === undefined || eventName === 'constructor') {
            console.error('Unknown event type', eventName, 'received')
        } else {
            return handler.bind(this)(connection_id, args)
        }
    }

    buildTx(connection_id: string, args: any[]) {
        const [body, submit] = args
        if (submit) {
            return txSubmitter.buildAndSubmitTx(body)
        } else {
            return kuber.buildTx(body)
        }
    }

    logEvent(connection_id: string, args: any[]) {
        const params: ILog = args[0]
        const txHash = params.txHash ? params.txHash : ''
        saveTriggerHistory(
            connection_id,
            params.function_name,
            params.trigger,
            params.success,
            params.message,
            params.triggerType,
            txHash,
            params.instanceIndex,
            params.parameters,
            params.internal,
            params.result
        ).catch((err) => console.error('SaveTriggerHistory : ', err))
    }

    loadFunds(connection_id: string, args: any[]) {
        const [address, amount] = args
        return this.managerWallet.transferWalletFunds(address, amount)
    }

    getFaucetBalance(connection_id: string, args: any[]) {
        const [address] = args
        return kuber.getBalance(address).then((data) => {
            return data.reduce((totalVal: number, item: any) => totalVal + item.value.lovelace, 0) / 10 ** 6
        })
    }

    saveMetadata(connection_id: string, args: any[]) {
        const [content] = args
        return metaDataService.saveMetadata(content)
    }

    checkAndSaveDrepRegistration(connection_id: string, args: any[]) {
        const [drepId] = args
        return dbSync
            .checkDrepRegistration(drepId)
            .then((res) => {
                console.log('Drep Registration Status: ', res['isRegisteredAsDRep'])
                updateAgentDrepRegistration(connection_id, res['isRegisteredAsDRep']).catch((err) =>
                    console.error('AgentUpdateError : ', err)
                )
            })
            .catch((err) => {
                throw err
            })
    }
}
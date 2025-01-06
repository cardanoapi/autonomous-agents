import { Executor } from './Executor'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { TxListener } from './TxListener'
import { TriggerType } from '../service/triggerService'
import { saveTxLog } from '../utils/agent'
import { loadRootKeyFromBuffer } from '../utils/cardano'
import { HdWallet } from 'libcardano'
import { AgentWalletDetails } from '../types/types'
import { globalState } from '../constants/global'
import { EventContext } from './BaseFunction'

export class AgentRunner {
    executor: Executor
    managerInterface: ManagerInterface

    constructor(managerInterface: ManagerInterface, txListener: TxListener) {
        this.managerInterface = managerInterface
        this.executor = new Executor(null, managerInterface, txListener)
    }

    invokeFunction(triggerType: TriggerType, instanceIndex: number, method: string, ...args: any) {
        this.executor.invokeFunction(method, ...args).then((result) => {
            saveTxLog(result, this.managerInterface, triggerType, instanceIndex)
        })
    }

    async invokeFunctionWithEventContext(
        eventFilterContext: any,
        context: EventContext,
        triggerType: TriggerType,
        instanceIndex: number,
        method: string,
        parameters: any[]
    ) {
        const eventContext = {
            event: context,
            filter: eventFilterContext,
            parameters,
        }
        const params = await this.executor
            .filterFunctionParams(method, eventContext)
            .catch((err) => console.error('Function Invocation Error: ', err))

        if (params) {
            this.executor.invokeFunctionWithContext(eventContext, method, ...params).then((result) => {
                saveTxLog(result, this.managerInterface, triggerType, instanceIndex)
            })
        }
    }

    async remakeContext(index: number) {
        const rootKey = loadRootKeyFromBuffer()
        const hdWallet = HdWallet.fromHdKey(rootKey)
        const account = await hdWallet.getAccount(index)
        const accountWallet = await account.singleAddressWallet()
        const agentInstanceWallet: AgentWalletDetails = {
            payment_signing_key: accountWallet.paymentKey.private.toString('hex'),
            stake_signing_key: accountWallet.stakeKey!.private.toString('hex'),
            payment_verification_key_hash: accountWallet.paymentKey.pkh.toString('hex'),
            stake_verification_key_hash: accountWallet.stakeKey!.pkh.toString('hex'),
            agent_address: accountWallet.getAddress(0).toBech32(),
            drep_id: accountWallet.stakeKey!.pkh.toString('hex'),
        }
        this.executor.remakeContext(agentInstanceWallet, this.managerInterface, `${globalState.agentName}#${index}`)
    }
}

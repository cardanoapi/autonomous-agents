import { AgentWalletDetails } from '../types/types'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { FunctionGroup, getHandlers } from './AgentFunctions'
import { Builtins, FunctionContext, Key, Wallet } from './BaseFunction'
import { TxListener } from './TxListener'
import { generateProposalMetadataContent } from '../utils/metadataContent/proposalMetadataContent'
import { generateRegisterDrepMetadataContent } from '../utils/metadataContent/drepMetadataContent'
import { generateVoteMetadataContent } from '../utils/metadataContent/voteMetadataContent'
import { rewardAddressBech32 } from '../utils/cardano'

export interface CallLog {
    function: string
    arguments: any[]
    return?: any
    error?: Error | string
}
export class Executor {
    wallet: any
    readonly rpcInterface: ManagerInterface
    readonly functions: FunctionGroup
    readonly functionContext: FunctionContext
    txListener: TxListener
    constructor(
        wallet: any,
        rpcInterface: ManagerInterface,
        txListener: TxListener
    ) {
        this.wallet = wallet
        this.functions = getHandlers()
        this.rpcInterface = rpcInterface
        this.txListener = txListener
        this.functionContext = {
            wallet: wallet,
            kuber: {
                buildTx: (spec: any) => {
                    return this.rpcInterface.buildTx(spec, false)
                },
                buildAndSubmit: (spec: any) => {
                    return this.rpcInterface.buildTx(spec, false)
                },
            },
            builtins: this.getBuiltins(wallet),
            agentName: '',
            helpers: this.getHelpers(wallet, ''),
        }
    }

    getHelpers(wallet: any, agentName: string) {
        const context = this.functionContext
        return {
            generateProposalMetadataContent: () =>
                generateProposalMetadataContent(agentName),
            generateDrepMetadataContent: () =>
                generateRegisterDrepMetadataContent(
                    agentName,
                    wallet.paymentKey.private
                ),
            generateVoteMetadataContent: () => generateVoteMetadataContent(),
        }
    }

    makeWallet(walletDetails: AgentWalletDetails): Wallet {
        const txSubmissionHold: any[] = []
        let isProcessing: boolean = false
        const paymentKey: Key = {
            private: walletDetails.payment_signing_key,
            public: walletDetails.payment_signing_key,
            pubKeyHash: walletDetails.payment_verification_key_hash,
            signRaw: (data: Buffer): Buffer => {
                throw new Error('Key.signRaw is not implemented')
            },
            verify: (signature: Buffer): Buffer => {
                throw new Error('Key.signRaw is not implemented')
            },
        }
        const stakeKey: Key = {
            private: walletDetails.stake_signing_key,
            public: walletDetails.payment_signing_key,
            pubKeyHash: walletDetails.stake_verification_key_hash,
            signRaw: (data: Buffer): Buffer => {
                throw new Error('Key.signRaw is not implemented')
            },
            verify: (signature: Buffer): Buffer => {
                throw new Error('Key.signRaw is not implemented')
            },
        }
        const rewardAddress = rewardAddressBech32(
            0,
            walletDetails.stake_verification_key_hash
        )
        console.log(
            'Account keys received : addresses =>',
            walletDetails.agent_address,
            rewardAddress
        )
        return {
            address: walletDetails.agent_address,
            paymentKey: paymentKey,
            stakeKey: stakeKey,
            drepId: walletDetails.drep_id,
            rewardAddress: rewardAddress,
            buildAndSubmit: (spec: any, stakeSigning?: boolean) => {
                spec.selections = [
                    walletDetails.agent_address,
                    {
                        type: 'PaymentSigningKeyShelley_ed25519',
                        description: 'Payment Signing Key',
                        cborHex: '5820' + paymentKey.private,
                    },
                ]
                if (stakeSigning) {
                    spec.selections.push({
                        type: 'PaymentSigningKeyShelley_ed25519',
                        description: 'Stake Signing Key',
                        cborHex: '5820' + stakeKey.private,
                    })
                }
                return new Promise((resolve, reject) => {
                    txSubmissionHold.push({ request: spec, resolve, reject })
                    console.log('Queue is : ', txSubmissionHold)
                    if (!isProcessing) {
                        processQueue(this.rpcInterface, this.txListener)
                    }
                })
                async function processQueue(
                    rpcInterface: ManagerInterface,
                    txListener: TxListener
                ) {
                    isProcessing = true
                    while (txSubmissionHold.length > 0) {
                        const { request, resolve, reject } =
                            txSubmissionHold.shift()
                        try {
                            const res = await rpcInterface.buildTx(
                                request,
                                true
                            )
                            resolve(res)
                            await txListener
                                .addListener(res.hash, 0, 80000)
                                .then(() => {
                                    console.log(
                                        'Tx matched :',
                                        res.hash,
                                        txSubmissionHold
                                    )
                                })
                                .catch((e) => {
                                    console.error('TXListener Error: ', e)
                                    return
                                })
                        } catch (error) {
                            reject(error)
                        }
                    }
                    isProcessing = false
                }
            },

            signTx: (txRaw: Buffer, stakeSigning?: boolean): Buffer => {
                throw new Error('Key.signRaw is not implemented')
            },
        }
    }

    remakeContext(
        agent_wallet: AgentWalletDetails,
        managerInterface: ManagerInterface,
        agentName: string
    ) {
        this.functionContext.wallet = this.makeWallet(agent_wallet)
        this.functionContext.builtins = this.getBuiltins(
            this.functionContext.wallet
        )
        this.functionContext.agentName = agentName
        this.functionContext.helpers = this.getHelpers(
            this.functionContext.wallet,
            agentName
        )
        managerInterface
            .getFaucetBalance(this.functionContext.wallet.address)
            .then((balance) => {
                if (balance <= 10000) {
                    this.functionContext.builtins
                        .loadFunds(1000)
                        .then((res) => console.log('Wallet load: ', res))
                        .catch((err) => console.error(err))
                }
            })
            .catch((err) => {
                console.error('GetBalance : ', err)
                throw err
            })
    }

    makeProxy<T>(context: T): { proxy: T; callLog: CallLog[] } {
        const callLog: CallLog[] = []
        // Step 2: Define the handler

        const handler = {
            get(target: any, property: any, receiver: any) {
                const origMethod = target[property]
                if (typeof origMethod === 'function') {
                    return function (...args: any) {
                        const log: CallLog = {
                            function: property,
                            arguments: args,
                        }
                        callLog.push(log)
                        const onSuccess = (result: any) => {
                            log.return = result
                            return result
                        }
                        const onError = (err: any) => {
                            log.error = err
                            throw err // Re-throw error after logging
                        }
                        try {
                            // Call the original method with the correct `this` context
                            //@ts-expect-error ts(2345)
                            const result = origMethod.apply(this, args)

                            // If the result is a Promise, handle its resolution and rejection
                            if (result instanceof Promise) {
                                return result.then(onSuccess).catch(onError)
                            } else {
                                // If the result is not a Promise, just log it directly
                                return onSuccess(result)
                            }
                        } catch (error: any) {
                            onError(error)
                        }
                    }.bind(receiver) // Ensure `this` is bound correctly
                }
                return Reflect.get(target, property, receiver)
            },
        }

        return {
            proxy: new Proxy(context, handler),
            callLog: callLog,
        }
    }

    getBuiltins(wallet: Wallet): Builtins {
        const builtins = this.functions.builtins
        const context = this.functionContext
        const updatedBuiltins: any = {}

        Object.keys(this.functions.builtins).forEach((key) => {
            const f = builtins[key]
            updatedBuiltins[key] = (...args: any) => f(context, ...args)
        })
        return {
            waitTxConfirmation: async (
                txId: string,
                confirmation: number,
                timeout: number
            ): Promise<unknown> => {
                return await this.txListener.addListener(
                    txId,
                    confirmation,
                    timeout
                )
            },
            loadFunds: async (amount: number): Promise<any> => {
                return await this.rpcInterface.loadFunds(wallet.address, amount)
            },
            saveMetadata: async (content) => {
                return await this.rpcInterface.saveMetadata(content)
            },
            ...updatedBuiltins,
        } as Builtins
    }

    invokeFunction(name: string, ...args: any): Promise<CallLog[]> {
        const f: any | undefined = this.functions.functions[name]
        const log: CallLog = {
            function: name,
            arguments: args,
        }
        if (f === undefined) {
            log.error = new Error('Function not defined')
            return Promise.resolve([log])
        }

        const newContext = { ...this.functionContext }
        const builtinsProxy = this.makeProxy(newContext.builtins)
        newContext.builtins = builtinsProxy.proxy
        builtinsProxy.callLog.push(log)

        try {
            const result: any = f(
                newContext,
                ...args.map((arg: any) => arg.value)
            )
            if (result instanceof Promise) {
                return result
                    .then((v) => {
                        log.return = v
                    })
                    .catch((e) => {
                        log.error = e
                    })
                    .then(() => {
                        return Promise.resolve(builtinsProxy.callLog)
                    })
            } else {
                log.return = result
            }
        } catch (err: any) {
            //this means that there was error in function execution setup.
            // there won't be any promise or result returned.
            log.error = err
        }
        return Promise.resolve(builtinsProxy.callLog)
    }
    // newBlock(block) {}
}

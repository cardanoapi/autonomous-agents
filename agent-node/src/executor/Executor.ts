import { AgentWalletDetails } from '../types/types'
import { ManagerInterface } from '../service/ManagerInterfaceService'
import { FunctionGroup, getHandlers } from './AgentFunctions'
import { Builtins, FunctionContext, Key, Wallet } from './BaseFunction'
import { TxListener } from './TxListener'

export interface CallLog {
    function: string
    arguments: any[]
    return?: any
    error?: Error
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
        }
    }
    makeWallet(walletDetails: AgentWalletDetails): Wallet {
        const txSubmissionHold: any[] = []
        const txHash: string | null = null
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
        console.log(
            'Account keys received : address =>',
            walletDetails.agent_address
        )
        return {
            address: walletDetails.agent_address,
            paymentKey: paymentKey,
            stakeKey: stakeKey,
            drepId: walletDetails.drep_id,
            buildAndSubmit: (spec: any, stakeSigning?: boolean) => {
                spec.selections = [
                    walletDetails.agent_address,
                    {
                        type: 'PaymentSigningKeyShelley_ed25519',
                        description: 'Payment Signing Key',
                        cborHex: paymentKey.private,
                    },
                ]
                if (stakeSigning) {
                    spec.selections.push({
                        type: 'PaymentSigningKeyShelley_ed25519',
                        description: 'Stake Signing Key',
                        cborHex: stakeKey.private,
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
    remakeContext(agent_wallet: AgentWalletDetails) {
        this.functionContext.wallet = this.makeWallet(agent_wallet)
        this.functionContext.builtins = this.getBuiltins(
            this.functionContext.wallet
        )
    }

    makeProxy<T>(context: T): { proxy: T; callLog: CallLog[] } {
        const callLog: CallLog[] = []
        // Step 2: Define the handler

        const handler = {
            get(target: any, property: any, receiver: any) {
                const origMethod = target[property]
                if (typeof origMethod === 'function') {
                    return function (...args: any) {
                        const onSuccess = (result: any) => {
                            callLog.push({
                                function: property,
                                arguments: args,
                                return: result,
                            })
                            return result
                        }
                        const onError = (err: any) => {
                            callLog.push({
                                function: property,
                                arguments: args,
                                error: err,
                            })
                            throw err // Re-throw error after logging
                        }
                        try {
                            // Call the original method with the correct `this` context
                            //@ts-expect-error
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
            ...updatedBuiltins,
        } as Builtins
    }

    invokeFunction(name: string, ...args: any): Promise<CallLog[]> {
        const f: Function | undefined = this.functions.functions[name]
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
            const result: any = f(newContext, ...args)
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

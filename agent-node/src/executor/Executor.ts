import { AgentWalletDetails } from '../types/types'
import { ManagerInterface } from './../service/ManagerInterfaceService'
import { getHandlers } from './AgentFunctions'
import { Builtins, DelegationTarget, FunctionContext, Key, OffchainData, Wallet } from './BaseFunction'
export interface CallLog {
    function: string,
    arguments: any[],
    return?: any
    error?:Error
}
export class Executor {
    wallet: any
    rpcInterface: ManagerInterface
    functions: {[key: string]: Function}
    functionContext:FunctionContext
    constructor(wallet: any, rpcInterface: ManagerInterface) {
        this.wallet = wallet
        this.functions=getHandlers()
        this.rpcInterface = rpcInterface
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
    makeWallet(walletDetails:AgentWalletDetails):Wallet{
        const paymentKey:Key={
            private: walletDetails.payment_signing_key,
            public: walletDetails.payment_signing_key,
            pubKeyHash:walletDetails.payment_verification_key_hash,
            signRaw:(data:Buffer)=>{throw new Error ("Key.signRaw is not implemented")},
            verify: (signature:Buffer)=>{throw new Error ("Key.signRaw is not implemented")}
        }
        const stakeKey:Key = {
            private: walletDetails.stake_signing_key,
            public: walletDetails.payment_signing_key,
            pubKeyHash:walletDetails.stake_verification_key_hash,
            signRaw:(data:Buffer)=>{throw new Error ("Key.signRaw is not implemented")},
            verify: (signature:Buffer)=>{throw new Error ("Key.signRaw is not implemented")}
        }
        console.log("Received wallet details",walletDetails)
        return {
            address: walletDetails.agent_address,
            paymentKey: paymentKey,
            stakeKey: stakeKey,
            drepId: walletDetails.drep_id,
            buildAndSubmit:(spec:any,stakeSigning?:boolean)=>{
                spec.selections = [
                    walletDetails.agent_address,
                    {
                        type: 'Signingkey PaymentKey',
                        description: '',
                        cborHex: paymentKey.private,
                    },
                ]
                if (stakeSigning) {
                    spec.selections.push({
                        type: 'Signingkey PaymentKey',
                        description: '',
                        cborHex: stakeKey.private,
                    })
                }
                return this.rpcInterface.buildTx(spec, true)
            },
            
            signTx:(txRaw:Buffer,stakeSigning?:boolean)=>{throw new Error ("Key.signRaw is not implemented")}
        }

    }
    remakeContext(agent_wallet:AgentWalletDetails){
        const wallet=this.makeWallet(agent_wallet)
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

    makeProxy<T>(context:T):{proxy:T,callLog:CallLog[]} {

        const callLog:CallLog[]=[]
        // Step 2: Define the handler
        
        const handler = {
            get(target:any, property:any, receiver:any) {
                const origMethod = target[property]
                if (typeof origMethod === 'function') {
                    return function (...args:any) {
                        const onSuccess=(result:any)=>{
                            callLog.push({
                                "function": property,
                                "arguments": args,
                                "return": result
                            })
                            return result
                        }
                        const onError=(err:any)=>{
                            callLog.push({
                                "function": property,
                                "arguments": args,
                                "error": err
                            })
                            throw err // Re-throw error after logging
                        }
                        try {
                            // Call the original method with the correct `this` context
                            //@ts-ignore
                            const result = origMethod.apply(this, args)
                            

                            // If the result is a Promise, handle its resolution and rejection
                            if (result instanceof Promise) {
                                return result
                                    .then(onSuccess)
                                    .catch(onError)
                            } else {
                                // If the result is not a Promise, just log it directly
                                return onSuccess(result)
                                
                            }
                        } catch (error:any) {
                            onError(error)
                        }
                    }.bind(receiver) // Ensure `this` is bound correctly
                }
                return Reflect.get(target, property, receiver)
            },
        }

        return {
            proxy:new Proxy(context, handler),
            callLog:callLog
        } 

    }
    getBuiltins(wallet: Wallet):Builtins {

        const stake = (type: string) => {
            return () => {
                return wallet.buildAndSubmit({
                    certificates: [
                        {
                            type: type,
                            key: wallet.stakeKey.pubKeyHash,
                        },
                    ],
                })
            }
        }
        return {
            // DRep functions
            dRepRegistration: (anchor?: OffchainData) => {
                return wallet.buildAndSubmit({
                    certificates: [
                        {
                            type: 'registerdrep',
                            key:  wallet.stakeKey.pubKeyHash,
                            anchor: anchor,
                        },
                    ],
                })
            },
            dRepDeRegistration: stake('deRegisterDrep'),
            registerStake: stake('registerstake'),
            stakeDeRegistration: stake('deregisterstake'),
            waitTxConfirmation(txid,count,timeout){

            },
            abstainDelegation: (target: DelegationTarget) => {
                if (typeof target !== 'object') {
                    target = {
                        drep: target,
                    }
                }
                return wallet.buildAndSubmit({
                    certificates: [
                        {
                            type: 'delegate',
                            key:  wallet.stakeKey.pubKeyHash,
                            ...target,
                        },
                    ],
                })
            },

            // Vote functions
            //@ts-ignore
            voteOnProposal: (
                proposal: string,
                vote: boolean | undefined | string,
                anchor?: OffchainData
            ) => {
                return wallet.buildAndSubmit({
                    vote: [
                        {
                            proposal: proposal,
                            voter:  wallet.stakeKey.pubKeyHash,
                            role: 'drep',
                            vote: vote,
                            anchor: anchor,
                        },
                    ],
                })
            },

            // Others
            transferADA: (
                address: string,
                amount: string | number | Record<string, any>
            ) => {
                return wallet.buildAndSubmit({
                    output: [
                        {
                            address: address,
                            value: amount,
                        },
                    ],
                })
            },
        }
    }
    
    dospatchLog(log:CallLog[]){
        console.log("callLog",log)

    }

    invokeFunction(name: string, ...args: any) {
        const f: any = this.functions[name]
        if(f===undefined){
            this.dospatchLog([
                {
                    function: name,
                    arguments: args,
                    error:new  Error("Function not defined")
                }])
            return 
        }
        const newContext = {...this.functionContext}
        const builtinsProxy=this.makeProxy(newContext.builtins)
        newContext.builtins=builtinsProxy.proxy
        
        try{
            const result:any=f(newContext,...args)
            if( result instanceof Promise){
                result.catch(e=>{
                    //ignore
                }).finally(()=>{
                    this.dospatchLog(builtinsProxy.callLog)
                })
            }
        }
        catch(err:any){
                //this means that there was error in function execution setup.
                // there won't be any promise or result returned.
                builtinsProxy.callLog.unshift(
                    {
                        function: name,
                        arguments: args,
                        error: err
                    })
                this.dospatchLog( builtinsProxy.callLog)
        }
    }
    newBlock(block){

    }
}

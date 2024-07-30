import { ManagerInterface } from './../service/ManagerInterfaceService'
import { Builtins, DelegationTarget, FunctionContext, OffchainData, Wallet } from './BaseFunction'
interface CallLog {
    function: string,
    arguments: any[],
    return?: any
    error?:Error
}
class Executor {
    wallet: any
    rpcInterface: ManagerInterface
    functions: any = {}
    functionContext:FunctionContext
    constructor(wallet: any, rpcInterface: ManagerInterface) {
        this.wallet = wallet
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
        const kuberWrapper = (spec: any, stake_key = false) => {
            spec.selections = [
                wallet.address,
                {
                    type: 'Signingkey PaymentKey',
                    description: '',
                    cborHex: wallet.paymentKey.private,
                },
            ]
            if (stake_key) {
                spec.selections.push({
                    type: 'Signingkey PaymentKey',
                    description: '',
                    cborHex: wallet.stakeKey.private,
                })
            }
            return this.rpcInterface.buildTx(spec, true)
        }
        const stake = (type: string) => {
            return () => {
                return kuberWrapper({
                    certificates: [
                        {
                            type: type,
                            key: wallet.stakeAddress,
                        },
                    ],
                })
            }
        }
        return {
            // DRep functions
            dRepRegistration: (anchor?: OffchainData) => {
                return kuberWrapper({
                    certificates: [
                        {
                            type: 'registerdrep',
                            key: wallet.stakeAddress,
                            anchor: anchor,
                        },
                    ],
                })
            },
            dRepDeRegistration: stake('dregisterdrep'),
            registerStake: stake('registerstake'),
            stakeDeRegistration: stake('dregisterstake'),

            abstainDelegation: (target: DelegationTarget) => {
                if (typeof target !== 'object') {
                    target = {
                        drep: target,
                    }
                }
                return kuberWrapper({
                    certificates: [
                        {
                            type: 'delegate',
                            key: wallet.stakeAddress,
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
                return kuberWrapper({
                    vote: [
                        {
                            voter: wallet.stakeAddress,
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
                return kuberWrapper({
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
    
    executeFunction(name: string, ...args: any) {
        const f: any = this.functions[name]
        const newContext = {...this.functionContext}
        const builtinsProxy=this.makeProxy(newContext.builtins)
        newContext.builtins=builtinsProxy.proxy
        
        try{
            const result:any=f(newContext,...args)
            console.log("CallResult",result)
        }
        catch(err){
                //donothing
                console.error("FunctionCall failed",err)
        }finally{
            console.log("FunctionCall",builtinsProxy.callLog)
        }
    }

    getFunction(fName: string): any {}
}

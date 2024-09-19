export interface Key {
    private: string
    public: string
    pubKeyHash: string
    signRaw(data: Buffer): Buffer
    verify(signature: Buffer): Buffer
}
export interface Wallet {
    address: string
    paymentKey: Key
    stakeKey: Key
    rewardAddress: string
    drepId: string
    buildAndSubmit(spec: any, stakeSigning?: boolean): Promise<any>
    signTx(txRaw: Buffer, stakeSigning?: boolean): Buffer
}

export interface KuberApi {
    buildTx(spec: any): Promise<any>
    buildAndSubmit(spec: any): Promise<any>
}
// types.ts

export interface TxInfo {
    txId: string
    cborHex: string
    [key: string]: any // Allows for additional properties
}
export interface OffchainData {
    url: string
    hash: string
}
export type DelegationTarget =
    | 'abstain'
    | 'no-confidence'
    | { drep: string }
    | { pool: string }
    | { drep: string; pool: string }

export interface Builtins {
    stakeDeRegistration: () => Promise<any>
    transferADA: (
        address: string,
        amount: string | number | Record<string, any>
    ) => Promise<any>
    waitTxConfirmation: (
        txId: string,
        confirmation: number,
        timeoutMs: number
    ) => Promise<unknown>
    dRepRegistration: (anchor?: OffchainData) => Promise<any>
    dRepDeRegistration: () => Promise<any>
    registerStake: () => Promise<any>
    voteOnProposal: (
        proposal: string,
        vote: boolean | string | undefined,
        anchor?: OffchainData
    ) => Promise<void>
    abstainDelegation: (target: DelegationTarget) => Promise<any>
    callWebhook: (
        url: string,
        data: Record<any, any> | any[] | string
    ) => Promise<any>
    loadFunds: (amount: number) => Promise<any>
    saveMetadata: (content: string) => Promise<any>
}

export interface Helpers {
    generateProposalMetadataContent: () => string
    generateDrepMetadataContent: () => string
    generateVoteMetadataContent: () => string
}

export interface FunctionContext {
    wallet: Wallet
    kuber: KuberApi
    builtins: Builtins
    agentName: string
    helpers: Helpers
}

// Create a restricted execution environment
export const restrictedExecution = function (
    functionString: string,
    context: Record<string, any>
) {
    // Provide only necessary globals and variables within a sandbox
    const restrictedGlobals = {
        Math,
        Date,
        Buffer,
        process: {},
        setTimeOut: (..._args: any) => {},
    }

    const executionContext = {
        ...restrictedGlobals,
        ...context,
        // You can add additional variables specific to this execution context
    }

    // Use Function constructor to create the function within the restricted environment
    const restrictedFunction = new Function(
        'context',
        `
    with(context) {
      ${functionString}
      return handler; // Make sure to return the function you want to execute
    }
  `
    )(executionContext)

    return restrictedFunction // Return the function to be executed
}

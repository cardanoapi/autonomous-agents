export interface Key{
    private: Buffer
    public: Buffer
    pubKeyHash():Buffer
    signRaw(data:Buffer):Buffer
    verify(signature:Buffer): Buffer

}
export interface Wallet{
        address: string,
        paymentKey: Key,
        stakeKey: Key
        stakeAddress():string
        drepId(): string
        buildAndSubmit(spec:any):Promise<any>
        signTx(txRaw:Buffer,stakeSigning?:boolean):Buffer
}

export interface KuberApi{
    buildTx(spec:any):Promise<any>
    buildAndSubmit(spec:any):Promise<any>
}
// types.ts

export interface TxInfo {
  txId: string;
  coorHex: string;
  [key: string]: any; // Allows for additional properties
}
export interface OffchainData {
  url: string;
  hash: string
}
export type DelegationTarget = 'abstain' | 'no-confidence' | {'drep': string} | {'pool': string} | {'drep': string,'pool': string}

export interface Builtins {
  // DRep functions
  dRepRegistration(anchor?:OffchainData): Promise<TxInfo>;
  dRepDeRegistration(): Promise<TxInfo>;
  registerStake(): Promise<TxInfo>;
  stakeDeRegistration(): Promise<TxInfo>;
  abstainDelegation(target:DelegationTarget): Promise<TxInfo>;

  // Vote functions
  voteOnProposal(proposal: string, anchor?: OffchainData): Promise<TxInfo>;

  // Proposal functions
  proposalNewConstitution(anchor: OffchainData, newConstitution: OffchainData): Promise<TxInfo>;
  createInfoGovAction(anchor: OffchainData): Promise<TxInfo>;


  treasuryWithdrawal(withdrawal: Array<{
          stakeAddress: string;
          amount: number;
      }>, anchor: OffchainData): Promise<TxInfo>;
  noConfidence(anchor:OffchainData): Promise<TxInfo>;

  updateCommittee(anchor: OffchainData, quorum: {
      numerator: number;
      denominator: number;
  }, add?: Array<{
      stakeAddress: string;
      activeEpoch: number;
  }>, remove?: Array<string>): Promise<TxInfo>;


  // Others
  transferADA(address: string, amount: string|number|Record<string,any>): Promise<TxInfo>;
}

export interface FunctionContext {
        wallet: Wallet,
        kuber: KuberApi,
        builtins:Builtins
}

// Create a restricted execution environment
export  const  restrictedExecution = function(functionString:string,context:Record<string,any>) {
  // Provide only necessary globals and variables within a sandbox
  const restrictedGlobals = {
    Math,
    Date,
    Buffer,
    process:{},
    setTimeOut: (..._args:any)=>{}
};

  const executionContext = {
    ...restrictedGlobals,
    ...context
    // You can add additional variables specific to this execution context
  };

  // Use Function constructor to create the function within the restricted environment
  const restrictedFunction = new Function('context', `
    with(context) {
      ${functionString}
      return handler; // Make sure to return the function you want to execute
    }
  `)(executionContext);

  return restrictedFunction; // Return the function to be executed
};
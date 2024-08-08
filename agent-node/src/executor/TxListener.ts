class TxListener{
  this.blockchain=blockchain
  constructor(blockchain:Blockchain){
    blockchain.on("block",()=>{
      this.onBlock()
    })
  }
  blocks[] // maintain last 10 blocks
  txs:
  onBlock(block)
  onRollback()
  addListener(txid:string,confirmation_count:number,timeout:number)
}
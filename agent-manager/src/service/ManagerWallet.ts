import getFaucetAdaForAddress, { faucetEnabled, fetchWalletBalance } from "../utils/fuacet";
import { kuber } from './kuber_service'
import environments from '../config/environments'
import { TxListener } from './TxListener'

export class ManagerWalletService {
    walletBalance: number = 0
    beneficiaryQueue: Array<Record<any, any>> = []
    isBusy = false
    txListener: TxListener
    managerWalletAddress = ''

    constructor(txListener: TxListener) {
        this.txListener = txListener
        this.managerWalletAddress = environments.managerWalletAddress
        this.fetchManagerWalletBalance()
    }

    async fetchManagerWalletBalance() {
        if (!this.managerWalletAddress) {
            this.walletBalance = 0
            return
        }
        fetchWalletBalance(this.managerWalletAddress)
            .then((data) => {
                this.walletBalance = data ? data : 0
            })
            .catch((err) => {
                console.error(err)
                this.walletBalance = 0
            })
    }

    async loadWalletFunds() {
        getFaucetAdaForAddress(this.managerWalletAddress)
            .then((data: any) => {
                console.log('Response for faucet load', data)
                this.fetchManagerWalletBalance()
            })
            .catch((err) => console.error(err))
    }

    async transferWalletFunds(address: string, amount: number) {
        if (!this.managerWalletAddress || !environments.managerWalletSigningKey) {
            throw new Error('Faucet is not enabled')
        }
        if (amount > this.walletBalance) {
            if(!faucetEnabled){
                throw new Error('Insufficient balance on manager wallet')
            }
            await this.loadWalletFunds()
        }
        if (this.beneficiaryQueue.length && this.isBusy) {
            return this.beneficiaryQueue[0].request.push({ address, value: `${amount}A` })
        }

        return new Promise((resolve, reject) => {
            this.beneficiaryQueue.push({ resolve, reject, request: [{ address, value: `${amount}A` }] })
            if (!this.isBusy) {
                this.processTransferQueue()
            }
        })
    }

    async processTransferQueue() {
        this.isBusy = true
        while (this.beneficiaryQueue.length > 0) {
            const beneficiaryData = this.beneficiaryQueue.shift()
            if (beneficiaryData) {
                const { resolve, reject, request } = beneficiaryData
                const body = {
                    selections: [environments.managerWalletSigningKey, environments.managerWalletAddress],
                    outputs: request,
                }
                try {
                    const res = await kuber.buildTx(body, true)
                    const transferredBalance = request.reduce(
                        (totalVal: number, item: any) => totalVal + item.value.split('A')[0],
                        0
                    )
                    this.walletBalance = this.walletBalance - transferredBalance
                    resolve(res)
                    await this.txListener
                        .addListener(res.hash, 0, 80000)
                        .then(() => {
                            console.log('Wallet Balance,Tx matched :', res.hash)
                        })
                        .catch((e) => {
                            console.error('TXListener Error: ', e)
                            return
                        })
                } catch (err) {
                    reject(err)
                }
            }
        }
        this.isBusy = false
    }
}

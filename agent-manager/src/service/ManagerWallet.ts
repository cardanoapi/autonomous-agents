import getFaucetAdaForAddress, { fetchWalletBalance } from '../utils/fuacet'
import { kuber } from './kuber_service'
import environments from '../config/environments'
import { TxListener } from './TxListener'

export class ManagerWalletService {
    walletBalance: number = 0
    beneficiaryQueue = []
    isBusy = false
    txListener: TxListener

    constructor(txListener: TxListener) {
        this.fetchManagerWalletBalance()
        this.txListener = txListener
    }

    fetchManagerWalletBalance() {
        fetchWalletBalance(environments.managerWalletAddress)
            .then((data) => {
                this.walletBalance = data ? data : 0
            })
            .catch((err) => {
                console.error(err)
                process.exit(1)
            })
    }

    loadWalletFunds() {
        getFaucetAdaForAddress(environments.managerWalletAddress)
            .then(() => {
                this.fetchManagerWalletBalance()
            })
            .catch((err) => console.error(err))
    }

    async transferWalletFunds(address: string, amount: number) {
        if (amount > this.walletBalance) {
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
            const { resolve, reject, request } = this.beneficiaryQueue.shift()
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
        this.isBusy = false
    }
}

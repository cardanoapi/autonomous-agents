import getFaucetAdaForAddress, { fetchWalletBalance } from '../utils/fuacet'
import { kuber } from './kuber_service'
import environments from '../config/environments'

export class ManagerWalletService {
    walletBalance: number = 0

    constructor() {
        this.fetchManagerWalletBalance()
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

    transferWalletFunds(address: string, amount: number) {
        if (amount > this.walletBalance) {
            this.loadWalletFunds()
        }
        const body = {
            selections: [environments.managerWalletSigningKey, environments.managerWalletAddress],
            outputs: [{ address, value: `${amount}A` }],
        }
        return kuber.buildTx(body, true).then((res) => {
            this.walletBalance = this.walletBalance - amount
            return res
        })
    }
}

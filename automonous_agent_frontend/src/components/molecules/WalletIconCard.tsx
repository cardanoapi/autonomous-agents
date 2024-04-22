import { ReactNode } from "react"


export interface IWalletIconCard {
    icon : React.ReactElement
    label : string
    href? : string
}


export default function WalletIconCard({icon , label , href} : IWalletIconCard){
    return (
        <div>
            {icon}
            {label}
            {label}
        </div>
    )
}
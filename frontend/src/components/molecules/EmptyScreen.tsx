import Link from "next/link"
import { Button } from "../atoms/Button"

export default function EmptyScreen({msg = "No Data" , linkHref , linkMsg , linkOnCLick} : {msg?: string , linkHref ?: string , linkMsg ?: string , linkOnCLick ?: any}) {
    return (
        <div className="w-full h-full justify-center items-center flex bg-brand-White-100 rounded-lg flex-col">
            <span className="text-base xl:text-xl text-gray-500 font-mono">{msg}</span>
            {
                linkMsg && linkHref && <Link href={linkHref} className="text-sm text-brand-Blue-200 mt-1 hover:cursor-pointer font-semibold">{linkMsg} </Link>
            }
            {
                linkMsg && linkOnCLick && <span  className="text-sm xl:text-sm text-brand-Blue-200 hover:cursor-pointer mt-1 font-semibold" onClick={linkOnCLick}>{linkMsg}</span>
            }
        </div>
    )
}
import { NumberInput } from "@app/components/molecules/NumberInput";
import { Input } from "@app/components/atoms/Input";
import { useEffect, useState } from "react";
import { onChange } from "node_modules/react-toastify/dist/core/store";

export default function CustomCron(onChange:any){

    
    const [seconds , setSeconds] = useState("*")
    const [minutes , setMinutes] = useState("*")
    const [hours , setHours] = useState("*")
    const [months , setMonths] = useState("*")
    const [years , setYears] = useState("*")
    
    const [cron , setCron] = useState([seconds,minutes,hours,months,years])

    useEffect(()=>{
        onChange?.(cron)
    },[setSeconds , setMinutes , setHours , setMonths , setYears])

    return (
        <div >
           <div className="flex items-center justify-center gap-2">
            <Input className="custom-cron-input custom-cron-text" value={seconds} onChange={(e) => setSeconds((e.target as HTMLInputElement).value)}/>
            <Input className="custom-cron-input custom-cron-text" value={minutes} onChange={(e) => setMinutes((e.target as HTMLInputElement).value)}/>
            <Input className="custom-cron-input custom-cron-text" value={hours} onChange={(e) => setHours((e.target as HTMLInputElement).value)}/>
            <Input className="custom-cron-input custom-cron-text" value={months} onChange={(e) => setMonths((e.target as HTMLInputElement).value)}/>
            <Input className="custom-cron-input custom-cron-text" value={years} onChange={(e) => setYears((e.target as HTMLInputElement).value)}/>
            </div>
            <div className="flex justify-center gap-3 mt-2">
                <span className="h3">Seconds</span>
                <span className="h3">Minutes</span>
                <span className="h3">Hours</span>
                <span className="h3">Months</span>
                <span className="h3">Years</span>
            </div>
        </div>
    )
}
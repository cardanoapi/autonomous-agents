import { NumberInput } from "@app/components/molecules/NumberInput";

export default function CustomCron(){
    return (
        <div >
           <div className="flex items-center justify-center gap-2">
            <NumberInput className="custom-cron-input"/>
            <NumberInput className="custom-cron-input"/>
            <NumberInput className="custom-cron-input"/>
            <NumberInput className="custom-cron-input"/>
            <NumberInput className="custom-cron-input"/>
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
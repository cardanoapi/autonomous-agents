import { RadioGroup , RadioGroupItem } from "@app/components/atoms/RadioGroup";
import { Label } from "@app/components/atoms/label";
import { NumberInput } from "@app/components/molecules/NumberInput";
import { Palette } from "lucide-react";

export default function DefaultCron({placeholder} : {placeholder : string}) {
    return (
        <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2 ">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one" size="small">Every {placeholder}</Label>
            </div>
            <div className="flex items-center space-x-2 ">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label className="flex items-center gap-x-2 h7" size="small">
                    Every <NumberInput className="w-12 h-6 rounded-none"/> {placeholder}
                </Label>
            </div>
            <div className="flex items-center space-x-2 ">
                <RadioGroupItem value="option-three" id="option-three" />
                <Label className="flex items-center gap-x-2 h7" size="small">
                    Every {placeholder} between <NumberInput className="w-12 h-6 rounded-none"/> {placeholder} and <NumberInput className="w-12 h-6 rounded-none"/> {placeholder}.
                </Label>
            </div>
        </RadioGroup>
    );
}

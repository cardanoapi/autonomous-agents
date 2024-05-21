import { useEffect, useState } from 'react';

import { onChange } from 'node_modules/react-toastify/dist/core/store';

import { Input } from '@app/components/atoms/Input';
import { NumberInput } from '@app/components/molecules/NumberInput';

export default function CustomCron({
    customCron,
    onChange,
}: {
    customCron?: string[];
    onChange?: any;
}) {
    const [seconds, setSeconds] = useState(customCron ? customCron[0] : '*');
    const [minutes, setMinutes] = useState(customCron ? customCron[1] : '*');
    const [hours, setHours] = useState(customCron ? customCron[2] : '*');
    const [months, setMonths] = useState(customCron ? customCron[3] : '*');
    const [years, setYears] = useState(customCron ? customCron[4] : '*');

    const [cron, setCron] = useState([
        `${seconds}`,
        `${minutes}`,
        `${hours}`,
        `${months}`,
        `${years}`
    ]);

    useEffect(() => {
        const newCron = [`${seconds}`, `${minutes}`, `${hours}`, `${months}`, `${years}`]
        setCron(newCron);
        onChange?.(newCron)
    }, [seconds, minutes, hours, months, years]);

    return (
        <div>
            <div className="flex items-center justify-center gap-2">
                <Input
                    className="custom-cron-input custom-cron-text"
                    value={seconds}
                    onChange={(e) => setSeconds((e.target as HTMLInputElement).value)}
                />
                <Input
                    className="custom-cron-input custom-cron-text"
                    value={minutes}
                    onChange={(e) => setMinutes((e.target as HTMLInputElement).value)}
                />
                <Input
                    className="custom-cron-input custom-cron-text"
                    value={hours}
                    onChange={(e) => setHours((e.target as HTMLInputElement).value)}
                />
                <Input
                    className="custom-cron-input custom-cron-text"
                    value={months}
                    onChange={(e) => setMonths((e.target as HTMLInputElement).value)}
                />
                <Input
                    className="custom-cron-input custom-cron-text"
                    value={years}
                    onChange={(e) => setYears((e.target as HTMLInputElement).value)}
                />
            </div>
            <div className="mt-2 flex justify-center gap-3">
                <span className="h3">Seconds</span>
                <span className="h3">Minutes</span>
                <span className="h3">Hours</span>
                <span className="h3">Months</span>
                <span className="h3">Years</span>
            </div>
        </div>
    );
}

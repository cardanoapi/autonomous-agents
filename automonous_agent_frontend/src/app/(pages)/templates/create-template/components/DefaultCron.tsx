import { useEffect, useState } from 'react';

import { RadioGroup, RadioGroupItem } from '@app/components/atoms/RadioGroup';
import { Label } from '@app/components/atoms/label';
import { cn } from '@app/components/lib/utils';
import { NumberInput } from '@app/components/molecules/NumberInput';

import { ICronSetting } from './TriggerTab';

export default function DefaultCron({
    cronSetting,
    onChange,
    defaultSelected = '',
    setDefaultSelected
}: {
    cronSetting: ICronSetting;
    defaultSelected?: string;
    setDefaultSelected?: any;
    onChange?: any;
}) {
    const [cron, setCron] = useState<string[]>([]);
    const [optionTwo, setOptionTwo] = useState('1');
    const [optionThreeStart, setOptionThreeStart] = useState('1');
    const [optionThreeEnd, setOptionThreeEnd] = useState('1');
    const [selected, setSelected] = useState<string>('');

    return (
        <RadioGroup defaultValue={defaultSelected}>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value={`${cronSetting.placeholder}-option-one`}
                    id={`${cronSetting.placeholder}-option-one`}
                    onClick={() => {
                        setSelected(`${cronSetting.placeholder}-option-one`);
                        setDefaultSelected?.(`${cronSetting.placeholder}-option-one`);
                        setCron(cronSetting.default);
                        onChange?.(cronSetting.default);
                    }}
                />
                <Label className="font-normal" size="small">
                    Every {cronSetting.placeholder}
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value={`${cronSetting.placeholder}-option-two`}
                    id={`${cronSetting.placeholder}-option-two`}
                    onClick={() => {
                        setSelected(`${cronSetting.placeholder}-option-two`);
                        setDefaultSelected?.(`${cronSetting.placeholder}-option-two`);
                        const newExpression = cron.map((item, index) => {
                            if (index !== cronSetting.index) {
                                return item;
                            } else {
                                return `*/${optionTwo}`;
                            }
                        });
                        setCron(newExpression);
                        onChange?.(newExpression);
                    }}
                />

                <Label className="h7 flex items-center gap-x-2" size="small">
                    Every
                    <NumberInput
                        className={cn('h-6 w-12 rounded-none')}
                        onChange={(e) => {
                            setOptionTwo(e.target.value);
                            const newExpression = cron.map((item, index) => {
                                if (index !== cronSetting.index) {
                                    return item;
                                } else {
                                    return `*/${optionTwo}`;
                                }
                            });
                            setCron(newExpression)
                            onChange?.(newExpression);
                        }}
                        defaultValue={1}
                        disabled={selected !== `${cronSetting.placeholder}-option-two`}
                    />{' '}
                    {cronSetting.placeholder}
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value={`${cronSetting.placeholder}-option-three`}
                    id={`${cronSetting.placeholder}-option-three`}
                    onClick={() => {
                        setSelected(`${cronSetting.placeholder}-option-three`);
                        setDefaultSelected?.(`${cronSetting.placeholder}-option-three`);
                        const newExpression = cron.map((item, index) => {
                            if (index !== cronSetting.index) {
                                return item;
                            } else {
                                return `${optionThreeStart}-${optionThreeEnd}`;
                            }
                        });
                        setCron(newExpression)
                        onChange?.(newExpression);
                    }}
                />
                <Label className="h7 flex items-center gap-x-2" size="small">
                    Every {cronSetting.placeholder} between
                    <NumberInput
                        className={cn('h-6 w-12 rounded-none')}
                        onChange={(e) => {
                            setOptionThreeStart(e.target.value);
                            const newExpression = cron.map((item, index) => {
                                if (index !== cronSetting.index) {
                                    return item;
                                } else {
                                    return `${optionThreeStart}-${optionThreeEnd}`;
                                }
                            });
                            setCron(newExpression);
                            onChange?.(newExpression);
                        }}
                        defaultValue={1}
                        disabled={selected !== 'option-three'}
                    />
                    {cronSetting.placeholder} and
                    <NumberInput
                        className={cn('h-6 w-12 rounded-none')}
                        onChange={(e) => {
                            setOptionThreeEnd(e.target.value);
                            const newExpression = cron.map((item, index) => {
                                if (index !== cronSetting.index) {
                                    return item;
                                } else {
                                    return `${optionThreeStart}-${optionThreeEnd}`;
                                }
                            });
                            setCron(newExpression);
                            onChange?.(newExpression);
                        }}
                        defaultValue={1}
                        disabled={selected !== `${cronSetting.placeholder}-option-three`}
                    />
                    Min.
                </Label>
            </div>
        </RadioGroup>
    );
}

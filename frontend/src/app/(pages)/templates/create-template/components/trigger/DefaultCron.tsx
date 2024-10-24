import { useState } from 'react';

import { RadioGroup, RadioGroupItem } from '@app/components/atoms/RadioGroup';
import { Label } from '@app/components/atoms/label';
import { cn } from '@app/components/lib/utils';
import { NumberInput } from '@app/components/molecules/NumberInput';

import { ICronSetting, IInputSetting } from './TriggerTab';

export default function DefaultCron({
    cronSetting,
    onChange,
    defaultSelected = '',
    setDefaultSelected,
    saveConfiguration,
    configuredSettings
}: {
    cronSetting: ICronSetting;
    defaultSelected?: string;
    setDefaultSelected?: any;
    onChange?: any;
    saveConfiguration?: any;
    configuredSettings?: IInputSetting[];
}) {
    const [cron, setCron] = useState<string[]>(cronSetting.default);
    const [optionTwo, setOptionTwo] = useState('1');
    const [optionThreeStart, setOptionThreeStart] = useState('1');
    const [optionThreeEnd, setOptionThreeEnd] = useState('1');
    const [selected, setSelected] = useState<string>(defaultSelected || '');

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
                                    return `*/${e.target.value}`;
                                }
                            });
                            setCron(newExpression);
                            onChange?.(newExpression);
                            saveConfiguration({
                                value: e.target.value,
                                name: `${cronSetting.placeholder}-option-two`
                            });
                        }}
                        defaultValue={
                            configuredSettings?.find(
                                (item) =>
                                    item.name ===
                                    `${cronSetting.placeholder}-option-two`
                            )?.value || '1'
                        }
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
                        setCron(newExpression);
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
                                    return `${e.target.value}-${optionThreeEnd}`;
                                }
                            });
                            setCron(newExpression);
                            onChange?.(newExpression);
                            saveConfiguration({
                                value: e.target.value,
                                name: `${cronSetting.placeholder}-option-three-start`
                            });
                        }}
                        defaultValue={
                            configuredSettings?.find(
                                (item) =>
                                    item.name ===
                                    `${cronSetting.placeholder}-option-three-start`
                            )?.value || '1'
                        }
                        disabled={
                            selected !== `${cronSetting.placeholder}-option-three`
                        }
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
                                    return `${optionThreeStart}-${e.target.value}`;
                                }
                            });
                            setCron(newExpression);
                            onChange?.(newExpression);
                            saveConfiguration({
                                value: e.target.value,
                                name: `${cronSetting.placeholder}-option-three-end`
                            });
                        }}
                        defaultValue={
                            configuredSettings?.find(
                                (item) =>
                                    item.name ===
                                    `${cronSetting.placeholder}-option-three-end`
                            )?.value || '1'
                        }
                        disabled={
                            selected !== `${cronSetting.placeholder}-option-three`
                        }
                    />
                    {cronSetting.placeholder}
                </Label>
            </div>
        </RadioGroup>
    );
}

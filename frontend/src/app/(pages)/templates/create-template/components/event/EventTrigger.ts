// for storing event meatadata
interface IEventFilterAtribute {
    id: string;
    label: string;
    type: string;
}

export interface IEventFilter {
    id: string;
    label: string;
    children: IEventFilterAtribute[];
}

export interface IEvent {
    id: string;
    label: string;
    filters: IEventFilter[];
}

export interface ISchema {
    id: string | string[];
    label: string;
    properties?: ISchema[];
    type?: string;
    validator?: (...args: any) => any;
}

export const transactionSchema: ISchema[] = [
    {
        id: 'tx',
        label: 'Transaction',
        type: 'object',
        properties: [
            // output
            {
                id: 'outputs',
                label: 'Ouput',
                type: 'object',
                properties: [
                    {
                        id: ['value', 'lovelace'],
                        label: 'value.lovelace',
                        type: 'bigint',
                        validator: (arg: number) => true
                    },
                    {
                        id: ['value', 'multiAsset'],
                        label: 'value.multiAsset',
                        type: 'map',
                        validator: (arg: number) => true
                    },
                    // address
                    {
                        id: ['address', 'raw'],
                        label: 'address',
                        type: 'string',
                        validator: (arg: any) => true
                    },
                    {
                        id: ['address', 'networkId'],
                        label: 'address.networkId',
                        type: 'number',
                        validator: (arg: number) => true
                    },
                    {
                        id: ['address', 'paymentPart', 'keyHash'],
                        label: 'address.paymentCredential.keyHash',
                        type: 'string',
                        validator: (arg: number) => true
                    },
                    {
                        id: ['address', 'paymentPart', 'scriptHash'],
                        label: 'address.paymentCredential.scriptHash',
                        type: 'string',
                        validator: (arg: number) => true
                    },
                    {
                        id: ['address', 'stakePart', 'keyHash'],
                        label: 'address.stakeCredential.keyHash',
                        type: 'string',
                        validator: (arg: number) => true
                    },
                    {
                        id: ['address', 'stakePart', 'scriptHash'],
                        label: 'address.stakeCredential.scriptHash',
                        type: 'string',
                        validator: (arg: number) => true
                    },
                    {
                        id: 'inlineDatum',
                        label: 'InlineDatum',
                        type: 'object'
                    },
                    //datumHash
                    {
                        id: 'datumHash',
                        label: 'DatumHash',
                        type: 'string',
                        validator: (arg: any) => true
                    },
                    //referenceScript
                    {
                        id: 'referenceScript',
                        label: 'ReferenceScript',
                        type: 'object',
                        validator: (arg: any) => true
                    }
                ]
            }
        ]
    }
];

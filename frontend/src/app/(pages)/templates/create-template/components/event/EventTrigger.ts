// for storing event meatadata
interface IEventFilterAtribute {
    id: string;
    label: string;
    type: string;
}

export interface IEventFilter {
    id: string;
    label: string;
    parameters: IEventFilterAtribute[];
}

export interface IEvent {
    id: string;
    label: string;
    filters: IEventFilter[];
}

export const Events: IEvent[] = [
    {
        id: 'tx',
        label: 'transaction',
        filters: [
            {
                id: 'output',
                label: 'tx.ouput',
                parameters: [
                    {
                        id: 'value',
                        label: 'value',
                        type: 'number'
                    },
                    {
                        id: 'address',
                        label: 'address',
                        type: 'string'
                    },
                    {
                        id: 'hash',
                        label: 'hash',
                        type: 'string'
                    }
                ]
            },
            {
                id: 'input',
                label: 'tx.input',
                parameters: [
                    {
                        id: 'value',
                        label: 'value',
                        type: 'number'
                    },
                    {
                        id: 'address',
                        label: 'address',
                        type: 'string'
                    }
                ]
            }
        ]
    }
];

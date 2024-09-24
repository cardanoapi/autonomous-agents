interface IEventMetaData {
    label: string;
    value: string;
}

export interface IFieldMetaData {
    label: string;
    name?: any;
    type: 'string' | 'number' | 'buffer' | 'enum' | 'list';
    fields?: IFieldMetaData[];
    defaultValue?: any;
    operators?: string[];
    options?: string[];
}

export interface IEventType {
    metaData: IEventMetaData;
    filters?: IFieldMetaData[];
}

const defaultOperators = ['=', '!=', '>', '<', '>=', '<='];

export const eventTypes: IEventType[] = [
    {
        metaData: {
            label: 'Transaction',
            value: 'transaction'
        },
        filters: [
            {
                label: 'Transaction Output',
                type: 'list',
                fields: [
                    {
                        label: 'address',
                        type: 'string',
                        operators: defaultOperators
                    },

                    {
                        label: 'value',
                        type: 'number',
                        defaultValue: 1,
                        operators: defaultOperators
                    },
                    {
                        label: 'datumHash',
                        type: 'buffer',
                        operators: defaultOperators
                    },
                    {
                        label: 'scriptRefrence',
                        type: 'enum',
                        options: ['script1', 'script2', 'script3']
                    }
                ]
            }
            // {
            //     label: 'Transaction Input',
            //     type: 'input',
            //     fields: [
            //         {
            //             label: 'txHash',
            //             type: 'Buffer'
            //         },
            //         {
            //             label: 'index',
            //             type: 'number',
            //             defaultValue: 0
            //         }
            //     ]
            // },
            // {
            //     label: 'Transaction Certificate',
            //     type: 'certificate',
            //     fields: [
            //         {
            //             label: 'address',
            //             type: 'string'
            //         },
            //         {
            //             label: 'value',
            //             type: 'number',
            //             defaultValue: 1
            //         },
            //         {
            //             label: 'datumHash',
            //             type: 'Buffer'
            //         }
            //     ]
            // },
            // {
            //     label: 'Vote Transaction',
            //     type: 'vote'
            // },
            // {
            //     label: 'Proposal Transaction',
            //     type: 'proposal'
            // },
            // {
            //     label: 'Mint Transaction',
            //     type: 'mint',
            //     fields: [
            //         {
            //             label: 'currencyName',
            //             type: 'string'
            //         },
            //         {
            //             label: 'tokenName',
            //             type: 'string'
            //         },
            //         {
            //             label: 'quantity',
            //             type: 'number',
            //             defaultValue: 1
            //         }
            //     ]
            // },
            // {
            //     label: 'Transaction Metadata',
            //     type: 'metadata'
            // },
            // {
            //     label: 'Withdrawal Transaction',
            //     type: 'withdrawal',
            //     fields: [
            //         {
            //             label: 'rewardAccount',
            //             type: 'buffer'
            //         },
            //         {
            //             label: 'amount',
            //             type: 'number',
            //             defaultValue: 1
            //         }
            //     ]
            // },
            // {
            //     label: 'Transaction Fee',
            //     type: 'fee',
            //     fields: [
            //         {
            //             label: 'fee',
            //             type: 'number',
            //             defaultValue: 1
            //         }
            //     ]
            // }
        ]
    },
    {
        metaData: {
            label: 'Block',
            value: 'block'
        }
    },
    {
        metaData: {
            label: 'Epoch',
            value: 'epoch'
        }
    }
];

export const getfieldsbyFilterLabel = (label: string) => {
    // Loop through each event type
    for (const eventType of eventTypes) {
        if (eventType.filters) {
            // Find the filter that matches the given label
            const foundFilter = eventType.filters.find(
                (filter) => filter.label === label
            );

            // If found, return the fields associated with the filter
            if (foundFilter) {
                return foundFilter.fields || [];
            }
        }
    }

    return [];
};

export const eventLabelMap = new Map([
    ['transaction', 'Tx'],
    ['block', 'Block'],
    ['epoch', 'Epoch'],
    ['Transaction Input', 'Tx Input'],
    ['Transaction Output', 'Tx Output'],
    ['Transaction Certificate', 'Tx Cert'],
    ['Vote Transaction', 'Vote Tx'],
    ['Proposal Transaction', 'Proposal Tx'],
    ['Mint Transaction', 'Mint Tx'],
    ['Transaction Metadata', 'Tx Metadata'],
    ['Withdrawal Transaction', 'Withdrawal Tx'],
    ['Transaction Fee', 'Tx Fee']
]);

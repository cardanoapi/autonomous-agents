interface IEventMetaData {
    label: string;
    value: string;
}

export interface IFieldMetaData {
    label: string;
    type: string;
    fields?: IFieldMetaData[];
    value?: any;
}

export interface IEventType {
    metaData: IEventMetaData;
    filters?: IFieldMetaData[];
}

export const eventTypes: IEventType[] = [
    {
        metaData: {
            label: 'Transaction',
            value: 'transaction'
        },
        filters: [
            {
                label: 'Transaction Output',
                type: 'output'
            },
            {
                label: 'Transaction Input',
                type: 'input',
                fields: [
                    {
                        label: 'txHash',
                        type: 'Buffer'
                    },
                    {
                        label: 'index',
                        type: 'number'
                    }
                ]
            },
            {
                label: 'Transaction Certificate',
                type: 'certificate',
                fields: [
                    {
                        label: 'address',
                        type: 'string'
                    },
                    {
                        label: 'value',
                        type: 'number'
                    },
                    {
                        label: 'datumHash',
                        type: 'Buffer'
                    }
                ]
            },
            {
                label: 'Vote Transaction',
                type: 'vote'
            },
            {
                label: 'Proposal Transaction',
                type: 'proposal'
            },
            {
                label: 'Mint Transaction',
                type: 'mint'
            },
            {
                label: 'Transaction Metadata',
                type: 'metadata'
            },
            {
                label: 'Withdrawal Transaction',
                type: 'withdrawal'
            },
            {
                label: 'Transaction Fee',
                type: 'fee'
            }
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

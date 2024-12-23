interface IEventFilterAtribute {
    id: string;
    label: string;
    type: string;
    operators?: string[];
    validator?: (arg: any) => any | undefined;
    properties?: IEventFilterAtribute[];
}

export interface ISchema extends Omit<IEventFilterAtribute, 'id'> {
    id: string | string[];
}

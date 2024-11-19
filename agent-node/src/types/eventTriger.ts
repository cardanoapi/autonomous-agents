import { Action } from '../service/triggerService'

export type BooleanOperator = 'AND' | 'OR'
export type ComparisonOperator = 'equals' | 'greaterThan' | 'lessThan' | 'in'

export interface IEventBasedAction {
    eventTrigger: IBooleanNode | IFieldNode
    triggeringFunction: Action
}

export interface IFieldNode {
    id: string | string[]
    value: any
    negate: boolean
    operator: ComparisonOperator
}

export interface IBooleanNode {
    id?:string|string[]
    children: IFilterNode[]
    negate: boolean
    operator: BooleanOperator
}

export type IFilterNode = IFieldNode | IBooleanNode

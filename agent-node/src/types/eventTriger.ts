import { Action } from '../service/triggerService'

export type BooleanOperator = 'AND' | 'OR'
export type ComparisonOperator = 'equals' | 'greaterThan' | 'lessThan' | 'in'

export interface IEventBasedAction {
    eventTrigger: IEventTrigger
    triggeringFunction: Action
}

export interface IEventTrigger {
    id: string | string[]
    parameters: IFilterNode[]
    negate: boolean
    operator: BooleanOperator
}

export interface IField {
    id: string | string[]
    value: any
    negate: boolean
    operator: ComparisonOperator
}

interface IChildrenFields {
    children: IFilterNode[]
    negate: boolean
    operator: BooleanOperator
}

export type IFilterNode = IField | IChildrenFields

import { ManagerInterface } from './ManagerInterfaceService'
import { Transaction } from 'libcardano/cardano/ledger-serialization/transaction'
import { AgentRunner } from '../executor/AgentRunner'
import {
    compareValue,
    getPropertyValue,
    reduceBooleanArray,
} from '../utils/validator'
import { IEventBasedAction, IField, IFilterNode } from '../types/eventTriger'

export class EventTriggerHandler {
    eventBasedActions: IEventBasedAction[] = []
    managerInterface: ManagerInterface
    constructor(managerInterface: ManagerInterface) {
        this.managerInterface = managerInterface
    }

    onBlock(transactions: Transaction[], agentRunners: AgentRunner[]) {
        if (this.eventBasedActions.length) {
            transactions.forEach((tx: Transaction) => {
                this.eventBasedActions.forEach((eventBasedAction) => {
                    const handler = (this as any)[
                        eventBasedAction.eventTrigger.id + 'Handler'
                    ]
                    if (handler !== undefined && handler !== 'constructor') {
                        handler.bind(this)(tx, eventBasedAction, agentRunners)
                    }
                })
            })
        }
    }

    transactionHandler(
        tx: Transaction,
        eventBasedAction: IEventBasedAction,
        agentRunners?: AgentRunner[]
    ) {
        const txProperty = Array.isArray(eventBasedAction.eventTrigger.id)
            ? getPropertyValue(tx, [
                  'body',
                  ...eventBasedAction.eventTrigger.id.splice(1),
              ])
            : tx.body
        const finalBooleanVals = this.getComparedBooleans(
            txProperty,
            eventBasedAction.eventTrigger.parameters
        )
        const { operator, negate } = eventBasedAction.eventTrigger
        const { function_name, parameters } =
            eventBasedAction.triggeringFunction
        const reducedFinalBoolValue = reduceBooleanArray(
            finalBooleanVals,
            operator,
            negate
        )
        if (reducedFinalBoolValue && agentRunners) {
            agentRunners.forEach((runner, index) => {
                runner.invokeFunction(
                    'EVENT',
                    index,
                    function_name,
                    ...parameters
                )
            })
        }
    }

    getComparedBooleans(tx: any, params: IFilterNode[]) {
        const comparedBooleanValues: Array<boolean> = []
        params.forEach((param) => {
            if ('id' in param) {
                comparedBooleanValues.push(
                    this.compareFields(tx, param as IField)
                )
            } else if ('children' in param) {
                const bools = this.getComparedBooleans(tx, param.children)
                comparedBooleanValues.push(
                    reduceBooleanArray(bools, param.operator, param.negate)
                )
            }
        })
        return comparedBooleanValues
    }

    compareFields(tx: any, param: IField) {
        const txPropertyValue = getPropertyValue(tx, param.id as [])
        if (!txPropertyValue) {
            return false
        }
        const comparisonResult = compareValue(
            param.operator,
            param.value,
            txPropertyValue
        )
        return param.negate ? !comparisonResult : comparisonResult
    }

    addEventActions(actions: IEventBasedAction[]) {
        this.eventBasedActions = actions
    }
}

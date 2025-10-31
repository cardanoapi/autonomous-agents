import { ManagerInterface } from './ManagerInterfaceService'
import { Transaction } from 'libcardano/cardano/ledger-serialization/transaction'
import { AgentRunner } from '../executor/AgentRunner'
import { compareValue } from '../utils/validator'
import { IBooleanNode, IEventBasedAction, IFieldNode, IFilterNode } from '../types/eventTriger'
import { DecodedBlock } from '../executor/TxListener'
import { reconstructTxFromPaths } from '../utils/event/eventFilterFormatter'
import { saveTxLog } from '../utils/agent'
import { customReplacer } from '../utils/validator'
import { callEventGate } from '../mcp/client'

export class EventTriggerHandler {
    eventBasedActions: IEventBasedAction[] = []
    managerInterface: ManagerInterface

    constructor(managerInterface: ManagerInterface) {
        this.managerInterface = managerInterface
    }

    onBlock(block: DecodedBlock, agentRunners: AgentRunner[]) {
        if (this.eventBasedActions.length) {
            block.body.forEach((tx: Transaction) => {
                this.eventBasedActions.forEach((eventBasedAction) => {
                    const handler = (this as any)['transactionHandler']
                    if (handler !== undefined && handler !== 'constructor') {
                        handler.bind(this)(tx, eventBasedAction, block, agentRunners)
                    }
                })
            })
        }
    }
    async transactionHandler(
        tx: Transaction,
        eventBasedAction: IEventBasedAction,
        block: DecodedBlock,
        agentRunners?: AgentRunner[]
    ) {
        let result
        const matchedTxPath: any = []
        try {
            result = this.solveNode(
                { tx: tx.body, transaction: tx.body },
                eventBasedAction.eventTrigger,
                [],
                matchedTxPath
            )
            console.debug('tx=', tx.hash.toString('hex'), 'solution=', result)
        } catch (e) {
            console.error('Error handling event', e)
            return
        }

        if (!result || !agentRunners?.length) return

        const matchedEventContext = reconstructTxFromPaths({ tx: tx.body }, matchedTxPath)

        const { function_name, parameters } = eventBasedAction.triggeringFunction
        const eventContext = { tx, block, confirmation: 1 }

        console.log('[EVENT] match:', {
            txHash: tx?.hash?.toString('hex'),
            fn: function_name,
        })

        //  MCP SAMPLING for event path (autonomous
        // 1. compact preview
        const preview = {
            txHash: tx.hash.toString('hex'),
            matched: matchedEventContext,
        }

        let previewJson = '{}'
        try {
            previewJson = JSON.stringify(preview, customReplacer).slice(0, 4000)
        } catch {
            // intentionally ignored
        }
        console.log('[EVENT][sampling] calling gate for', function_name)

        // 2. invoking sampling
        let decision = { execute: true, reason: 'sampling not configured' }

        try {
            decision = await callEventGate(function_name, parameters as any[], previewJson)
        } catch (e) {
            console.warn('[EVENT][sampling] error; default allow', e)
            decision = { execute: true, reason: 'sampling-error' }
        }

        console.log('[EVENT][sampling] decision=', decision)

        if (!decision.execute) {
            const blocked = [
                {
                    function: function_name,
                    arguments: parameters,
                    return: {
                        operation: function_name,
                        executed: false,
                        blocked_by_sampling: true,
                        sampling_reason: decision.reason,
                        message: `MCP sampling blocked (event): ${decision.reason}`,
                        timestamp: new Date().toISOString(),
                    },
                },
            ]

            try {
                saveTxLog(blocked, this.managerInterface, 'EVENT' as any, 0)
            } catch (e) {
                console.error('SaveTxLog (blocked) error:', e)
            }
            return
        }
        // 4. allowed -> invoke as usual
        agentRunners.forEach((runner, index) => {
            runner.invokeFunctionWithEventContext(
                matchedEventContext,
                eventContext,
                'EVENT',
                index,
                function_name,
                parameters
            )
        })
    }

    solveNode(targetObject: any, filterNode: IFilterNode, parentNodes: string[], matchedTxPath: any) {
        return this.solveNodeInternal(targetObject, filterNode, filterNode.id, parentNodes, matchedTxPath)
    }

    solveNodeInternal(
        targetObject: any,
        filterNode: IFilterNode,
        nodes: string[] | string | undefined,
        parent_nodes: string[],
        matchedTxPath: any
    ): boolean {
        if (nodes === undefined || nodes.length == 0) {
            const result =
                'children' in filterNode
                    ? this.solveBooleanNode(targetObject, filterNode, parent_nodes, matchedTxPath)
                    : this.solveFieldNode(targetObject, filterNode, parent_nodes, matchedTxPath)
            return filterNode.negate ? !result : result
        } else if (typeof nodes === 'string') {
            nodes = [nodes]
        }

        if (targetObject == null && filterNode.operator === 'exists') {
            return false
        }

        let result
        let propertyValue = targetObject[nodes[0]]
        if (!propertyValue) {
            propertyValue = targetObject[nodes[0] + 's']
            if (!propertyValue) return false
        }
        parent_nodes.push(nodes[0])

        const subArray = nodes.slice(1)
        if (Array.isArray(propertyValue)) {
            const node_pos = parent_nodes.length
            parent_nodes.push('')
            result = propertyValue.reduce((acc, node, index: number) => {
                if (acc) {
                    return acc
                }
                parent_nodes[node_pos] = index.toString()
                const result = this.solveNodeInternal(node, filterNode, subArray, parent_nodes, matchedTxPath)
                console.log(parent_nodes.join('.'), ': result=', result)
                return result
            }, false)
            parent_nodes.pop()
        } else {
            result = this.solveNodeInternal(propertyValue, filterNode, subArray, parent_nodes, matchedTxPath)
        }
        parent_nodes.pop()
        return result
    }

    solveBooleanNode(
        targetObject: any,
        filterNode: IBooleanNode,
        parent_nodes: string[] = [],
        matchedTxPath: any
    ): boolean {
        const orOperator = (a: boolean, b: boolean) => a || b
        let operator = orOperator
        if (filterNode.operator === 'AND') {
            operator = (a: boolean, b: boolean) => a && b
        }
        const result = filterNode.children.reduce((acc, node) => {
            return operator(acc, this.solveNodeInternal(targetObject, node, node.id, parent_nodes, matchedTxPath))
        }, operator !== orOperator)
        console.log('id=', filterNode.id, 'operator=', filterNode.operator, 'result=', result)
        return result
    }

    solveFieldNode(targetObject: any, filterNode: IFieldNode, parent_nodes: string[], matchedTxPath: any): boolean {
        const result = compareValue(filterNode.operator, filterNode.value, targetObject, parent_nodes)
        if (result) {
            const matchKey = parent_nodes.join('.') || 'root'
            matchedTxPath.push(matchKey)
        }
        return result
    }

    addEventActions(actions: IEventBasedAction[]) {
        this.eventBasedActions = actions
    }
}

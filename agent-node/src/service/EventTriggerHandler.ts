import {ManagerInterface} from './ManagerInterfaceService'
import {Transaction} from 'libcardano/cardano/ledger-serialization/transaction'
import {AgentRunner} from '../executor/AgentRunner'
import {
    compareValue,
} from '../utils/validator'
import {IBooleanNode, IEventBasedAction, IFieldNode, IFilterNode} from "../types/eventTriger";
import {node} from "globals";
import {bech32} from "bech32";
import {rewardAddressRawBytes} from "../utils/cardano";

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
                        'transactionHandler'
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
        let result
        try {
            console.log("Tx:", tx.hash.toString('hex'), "tx.outputs=", tx.body.outputs.length, "inputs=", tx.body.inputs.length)
            result = this.solveNode({tx: tx.body, transaction: tx.body}, eventBasedAction.eventTrigger, [])
            console.log("tx=", tx.hash.toString('hex'), "solution=", result)
        } catch (e) {
            console.error("Error handling event", e);
            return
        }

        const {function_name, parameters} = eventBasedAction.triggeringFunction
        if (result && agentRunners) {
            tx.body.outputs.map((o) => {
                const data = Buffer.from(o.address, 'hex');

                // Convert binary data into 5-bit groups as needed for Bech32
                const words = bech32.toWords(data);

                // Encode with Bech32 using the given prefix (usually 'stake')
                const a = bech32.encode('addr_test', words, 114);
                console.log('Hello world',a )
            })
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

    solveNode(targetObject: any, filterNode: IFilterNode, parentNodes: string[]) {
        return this.solveNodeInternal(targetObject,filterNode,filterNode.id,parentNodes)
  }

    solveNodeInternal(targetObject: any, filterNode: IFilterNode, nodes: string[] | string | undefined, parent_nodes: string[]): boolean {

        if (nodes === undefined || nodes.length == 0) {
            let result = 'children' in filterNode ? this.solveBooleanNode(targetObject, filterNode, parent_nodes)
                : this.solveFieldNode(targetObject, filterNode, parent_nodes)
            return filterNode.negate ? !result : result
        } else if (typeof nodes === "string") {
            nodes = [nodes]
        }

        let result
        const propertyValue = targetObject[nodes[0]]
        parent_nodes.push(nodes[0])

        let subArray = nodes.slice(1)
        if (Array.isArray(propertyValue)) {
            const node_pos = parent_nodes.length
            parent_nodes.push('')
            result = propertyValue.reduce((acc, node, index: number) => {
                if (acc) {
                    return acc
                }
                parent_nodes[node_pos] = index.toString()
                const result = this.solveNodeInternal(node, filterNode, subArray, parent_nodes)
                console.log(parent_nodes.join('.'), ": result=", result)
                return result
            }, false)
            parent_nodes.pop()
        } else {
            result = this.solveNodeInternal(propertyValue, filterNode, subArray, parent_nodes)
        }
        parent_nodes.pop()
        return result

    }

    solveBooleanNode(targetObject: any, filterNode: IBooleanNode, parent_nodes: string[] = []): boolean {
        let orOperator = (a: boolean, b: boolean) => a || b
        let operator = orOperator
        if (filterNode.operator === 'AND') {
            operator = (a: boolean, b: boolean) => a && b
        }
        const result = filterNode.children.reduce((acc, node) => {
            return operator(acc, this.solveNodeInternal(targetObject, node, node.id, parent_nodes))
        }, operator !== orOperator)
        console.log("id=", filterNode.id, "operator=", filterNode.operator, "result=", result)
        return result
    }

    solveFieldNode(targetObject: any, filterNode: IFieldNode, parent_nodes: string[]): boolean {

        return compareValue(
            filterNode.operator,
            filterNode.value,
            targetObject,
            parent_nodes
        )
    }

    addEventActions(actions: IEventBasedAction[]) {
        this.eventBasedActions = actions
    }
}

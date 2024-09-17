import { ManagerInterface } from './ManagerInterfaceService'
import { TxListener } from '../executor/TxListener'
import { BlockEvent } from 'libcardano/types'
import { parseRawBlockBody } from 'libcardano/cardano/ledger-serialization/transaction'
import { globalState } from '../constants/global'
import { clearScheduledTasks, scheduleFunctions } from '../utils/scheduler'
import {
    checkIfAgentWithEventTriggerTypeExists,
    createActionDtoForEventTrigger,
} from '../utils/agent'
import { ScheduledTask } from 'node-cron'
import { AgentRunner } from '../executor/AgentRunner'

export class RpcTopicHandler {
    managerInterface: ManagerInterface
    txListener: TxListener
    constructor(managerInterface: ManagerInterface, txListener: TxListener) {
        this.managerInterface = managerInterface
        this.txListener = txListener
    }
    handleEvent(
        eventName: string,
        message: any,
        agentRunners: Array<AgentRunner>,
        scheduledTasks: Array<ScheduledTask>
    ) {
        const handler = (this as any)[eventName]
        if (handler === undefined || eventName === 'constructor') {
            console.error('Unknown event type', eventName, 'received')
        } else {
            handler.bind(this)(message, agentRunners, scheduledTasks) // Ensure the correct `this` context
        }
    }

    extend_block(block: BlockEvent, agentRunners: Array<AgentRunner>) {
        const transactions = parseRawBlockBody(block.body)
        console.log(
            '[ New Block ]',
            'block=' + block.headerHash.toString('hex'),
            'slotNo=' + block.slotNo,
            'blockNo=' + block.blockNo,
            'txCount=' + transactions.length
        )
        this.txListener.onBlock({ ...block, body: transactions })
        if (
            globalState.eventTriggerTypeDetails.eventType &&
            transactions.length
        ) {
            transactions.forEach((tx: any) => {
                if (Array.isArray(tx.body.proposalProcedures)) {
                    tx.body.proposalProcedures.forEach(
                        (proposal: any, index: number) => {
                            const { function_name, parameters } =
                                createActionDtoForEventTrigger(tx, index)
                            agentRunners.forEach((runner, index) => {
                                runner.invokeFunction(
                                    'EVENT',
                                    index,
                                    function_name,
                                    ...(parameters as any)
                                )
                            })
                        }
                    )
                }
            })
        }
    }
    initial_config(
        message: any,
        agentRunners: Array<AgentRunner>,
        scheduledTasks: ScheduledTask[]
    ) {
        const { configurations } = message
        checkIfAgentWithEventTriggerTypeExists(configurations)
        agentRunners.forEach((runner, index) => {
            scheduleFunctions(
                this.managerInterface,
                runner,
                configurations,
                index,
                scheduledTasks
            )
        })
    }
    config_updated(
        message: any,
        agentRunners: Array<AgentRunner>,
        scheduledTasks: ScheduledTask[]
    ) {
        const { instanceCount, configurations } = message
        if (instanceCount != agentRunners.length) {
            if (instanceCount < agentRunners.length) {
                agentRunners.length = instanceCount
            } else {
                const increasedRunner = instanceCount - agentRunners.length
                Array(increasedRunner)
                    .fill('')
                    .forEach(async (item, index) => {
                        const runner = new AgentRunner(
                            this.managerInterface,
                            this.txListener
                        )
                        await runner.remakeContext(agentRunners.length + index)
                        agentRunners.push(runner)
                    })
            }
        }
        checkIfAgentWithEventTriggerTypeExists(configurations)
        clearScheduledTasks(scheduledTasks)
        agentRunners.forEach((runner, index) => {
            scheduleFunctions(
                this.managerInterface,
                runner,
                configurations,
                index,
                scheduledTasks
            )
        })
    }

    agent_keys(message: any) {}
    instance_count(args: any) {}
}

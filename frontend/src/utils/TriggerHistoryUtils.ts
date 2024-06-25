import { ITrigger } from '@app/app/api/trigger';
import { IAgentTriggerHistory } from '@app/app/api/triggerHistory';

export function filterSuccessTriggers(triggers: IAgentTriggerHistory[]) {
    const filteredTriggers = triggers.filter(
        (trigger: IAgentTriggerHistory) => trigger.success === true
    );
    return filteredTriggers;
}

export function calculateTriggerChangeRateforLast24Hours(
    // Calculates Change rate for Last 24 hours with last 48-24 hours.
    triggers: IAgentTriggerHistory[]
) {
    const last24HourSuccessTransactionsCount =
        getSuccessTriggersforLast24Hours(triggers).length;

    const prior24HourSuccessTransactionsCount = filterSuccessTriggersByDate(
        triggers,
        getYesterdayDate()
    ).length;

    if (prior24HourSuccessTransactionsCount === 0) {
        return last24HourSuccessTransactionsCount === 0 ? 0 : 100;
    }
    const changeRate =
        ((last24HourSuccessTransactionsCount - prior24HourSuccessTransactionsCount) /
            prior24HourSuccessTransactionsCount) *
        100;
    //console.log(`Last 24 hours ${last24HourSuccessTransactionsCount} , Total : ${totalTransactionsCount}`)
    //console.log(`Change Rate : ${changeRate}`)
    return changeRate;
}

export function filterSuccessTriggersByDate(
    triggers: IAgentTriggerHistory[],
    targetDate: string
) {
    const filteredTriggers = triggers.filter((trigger) => {
        const datePart = trigger.timestamp.split('T')[0];
        return datePart === targetDate && trigger.success === true;
    });
    return filteredTriggers;
}

export function getSuccessTriggersforLast24Hours(triggers: IAgentTriggerHistory[]) {
    const today = new Date().toISOString().split('T')[0];
    const successfullTriggers = filterSuccessTriggersByDate(triggers, today);
    return successfullTriggers;
}

export function accumulateSuccessfullTriggersforLast24Hours(
    triggers: IAgentTriggerHistory[],
    n: number
) {
    // Accumulates Last 24 Hours Successfull Transactions by n Hour difference in an Array and returns it
    // n should be less then 24!
    const last24HourSuccessTransactions = getSuccessTriggersforLast24Hours(triggers);
    const interval = 24 / n;
    const result = Array(n).fill(0);
    last24HourSuccessTransactions.forEach((item) => {
        const timestamp = new Date(item.timestamp);
        const hours = timestamp.getHours();

        const intervalIndex = Math.floor(hours / interval);

        if (intervalIndex >= 0 && intervalIndex < result.length) {
            result[intervalIndex]++;
        }
    });
    return result;
}

export function getYesterdayDate(): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

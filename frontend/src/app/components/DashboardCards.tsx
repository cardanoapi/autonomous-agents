import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useQuery } from '@tanstack/react-query';

import { ILineChartData } from '@app/components/Chart/CustomLineChart';

import { fetchActiveAgentsCount, fetchAgents } from '../api/agents';
import { fetchTemplates } from '../api/templates';
import OverViewAgentsCard from './OverViewAgentsCard';
import OverViewGraphCard from './OverViewGraphCard';
import OverViewTemplatesCard from './OverViewTemplatesCard';

function convertArraytoGraphDataFormat(
    arr: { count: number; values: Record<string, number> }[],
    smoothenBy?: number
): ILineChartData[] {
    // Create a new array that includes only the count
    let countArray = arr.map((element) => element.count);

    if (smoothenBy) {
        countArray = smoothenArray(countArray, smoothenBy);
    }

    return countArray.map((val, index) => ({
        name: `a${index}`,
        amt: val
    }));
}
function smoothenArray(arr: number[], n: number): number[] {
    return arr.reduce((acc, val, index) => {
        const chunkIndex = Math.floor(index / n);
        if (!acc[chunkIndex]) {
            acc[chunkIndex] = 0;
        }
        acc[chunkIndex] += val;
        return acc;
    }, [] as number[]);
}

const DashboardCards = () => {
    const { data: agents = [] } = useQuery({
        queryKey: ['agents'],
        queryFn: fetchAgents
    });
    const { data: activeAgents } = useQuery({
        queryKey: ['activeAgentsCount'],
        queryFn: fetchActiveAgentsCount
    });
    const { data: templates = [] } = useQuery({
        queryKey: ['templates'],
        queryFn: fetchTemplates
    });

    const { data: proposalMetric } = useQuery({
        queryKey: ['proposalMetric'],
        queryFn: () =>
            fecthTriggerHistoryMetric([
                'createInfoGovAction',
                'proposalNewConstitution'
            ])
    });

    const { data: voteMetric } = useQuery({
        queryKey: ['voteOnProposal'],
        queryFn: () => fecthTriggerHistoryMetric(['voteOnProposal'])
    });

    function getTotalValue(arr: { count: number; values: Record<string, number> }[]) {
        let total = 0;
        arr.forEach((element) => {
            total += element.count;
        });
        return total;
    }

    return (
        <div className="flex h-36 w-full grid-cols-4 gap-[12px] 2xl:gap-[25px] ">
            <OverViewAgentsCard
                title="No of Agents"
                totalAgents={agents.length || 'NA'}
                activeAgents={activeAgents?.online_agents_count}
                inactiveAgents={Math.max(
                    0,
                    agents.length - activeAgents?.online_agents_count
                )}
            />
            <OverViewTemplatesCard
                title="No of Templates"
                totalTemplates={templates.length}
                defaultTemplates={templates.length}
                customTemplates={0}
            />
            <OverViewGraphCard
                title="No of Proposals"
                totalValue={
                    (proposalMetric &&
                        getTotalValue(
                            proposalMetric.last_24hour_successful_triggers
                        )) ||
                    0
                }
                changeRate={
                    (proposalMetric && proposalMetric.today_fluctuation_rate) || 0
                }
                graphData={
                    proposalMetric !== undefined
                        ? convertArraytoGraphDataFormat(
                              proposalMetric.last_24hour_successful_triggers.toReversed() ||
                                  [],
                              6
                          )
                        : []
                }
            />
            <OverViewGraphCard
                title="No of Votes"
                totalValue={
                    (proposalMetric &&
                        getTotalValue(
                            proposalMetric?.last_24hour_successful_triggers
                        )) ||
                    0
                }
                changeRate={(voteMetric && voteMetric.today_fluctuation_rate) || 0}
                theme="Secondary"
                graphData={
                    voteMetric !== undefined
                        ? convertArraytoGraphDataFormat(
                              voteMetric.last_24hour_successful_triggers.toReversed() ||
                                  [],
                              6
                          )
                        : []
                }
            />
        </div>
    );
};

export default DashboardCards;

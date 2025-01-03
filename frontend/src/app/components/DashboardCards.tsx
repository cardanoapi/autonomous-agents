import { fetchActiveAgentsCount, fetchAgents } from '@api/agents';
import { fetchTemplates } from '@api/templates';
import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useQuery } from '@tanstack/react-query';

import { ILineChartData } from '@app/components/Chart/CustomLineChart';

import OverViewAgentsCard from './OverViewAgentsCard';
import OverViewGraphCard from './OverViewGraphCard';
import OverViewTemplatesCard from './OverViewTemplatesCard';

function convertArrayToGraphDataFormat(
    arr: { count: number; values: Record<string, number> }[],
    smoothenBy?: number
): ILineChartData[] {
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

const DashboardCards = ({ className }: { className?: string }) => {
    const { data: agents = [] } = useQuery({
        queryKey: ['agents'],
        queryFn: async () => fetchAgents({ page: 1, size: 50, search: '' })
    });

    const { data: activeAgents } = useQuery({
        queryKey: ['activeAgentsCount'],
        queryFn: async () => fetchActiveAgentsCount()
    });

    const { data: templates = [] } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => fetchTemplates({ page: 1, size: 50, search: '' })
    });

    const { data: proposalMetric } = useQuery({
        queryKey: ['proposalMetric'],
        queryFn: async () => fecthTriggerHistoryMetric(['createInfoGovAction', 'proposalNewConstitution'])
    });

    const { data: voteMetric } = useQuery({
        queryKey: ['voteOnProposal'],
        queryFn: async () => fecthTriggerHistoryMetric(['voteOnProposal'])
    });

    function getTotalValue(arr: { count: number; values: Record<string, number> }[]) {
        return arr.reduce((total, element) => total + element.count, 0);
    }

    return (
        <div className={className}>
            <OverViewAgentsCard
                title="No of Agents"
                totalAgents={agents.length || 'NA'}
                activeAgents={activeAgents?.online_agents_count || 0}
                inactiveAgents={Math.max(0, agents.length - activeAgents?.online_agents_count || 0)}
            />
            <OverViewTemplatesCard
                title="No of Templates"
                totalTemplates={templates.length}
                defaultTemplates={templates.length}
                customTemplates={0}
            />
            <OverViewGraphCard
                title="No of Proposals"
                totalValue={(proposalMetric && getTotalValue(proposalMetric.last_24hour_successful_triggers)) || 0}
                changeRate={(proposalMetric && proposalMetric.today_fluctuation_rate) || 0}
                graphData={
                    proposalMetric !== undefined
                        ? convertArrayToGraphDataFormat(
                              proposalMetric.last_24hour_successful_triggers.toReversed() || [],
                              6
                          )
                        : []
                }
            />
            <OverViewGraphCard
                title="No of Votes"
                totalValue={(voteMetric && getTotalValue(voteMetric.last_24hour_successful_triggers)) || 0}
                changeRate={(voteMetric && voteMetric.today_fluctuation_rate) || 0}
                theme="Secondary"
                graphData={
                    voteMetric !== undefined
                        ? convertArrayToGraphDataFormat(
                              voteMetric.last_24hour_successful_triggers.toReversed() || [],
                              6
                          )
                        : []
                }
            />
        </div>
    );
};

export default DashboardCards;
